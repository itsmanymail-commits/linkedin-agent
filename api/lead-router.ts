import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { leads, leadNotes, campaigns, companies } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const leadRouter = createRouter({
  listLeads: authedQuery
    .input(
      z.object({
        status: z.string().optional(),
        campaignId: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(leads.userId, ctx.user.id)];
      if (input.status) {
        conditions.push(eq(leads.status, input.status as "DISCOVERED" | "ENRICHED" | "QUALIFIED" | "DISQUALIFIED" | "PENDING" | "CONNECTED" | "COMPLETED" | "FAILED" | "IGNORED"));
      }
      if (input.campaignId) {
        conditions.push(eq(leads.campaignId, input.campaignId));
      }
      const items = await db
        .select()
        .from(leads)
        .where(and(...conditions))
        .orderBy(desc(leads.bayesianScore))
        .limit(input.limit)
        .offset((input.page - 1) * input.limit);
      return items;
    }),

  createLead: authedQuery
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        headline: z.string().optional(),
        summary: z.string().optional(),
        location: z.string().optional(),
        industry: z.string().optional(),
        linkedinUrl: z.string().optional(),
        linkedinId: z.string().optional(),
        profileImageUrl: z.string().optional(),
        skills: z.string().optional(),
        followers: z.number().default(0),
        status: z.enum(["DISCOVERED", "ENRICHED", "QUALIFIED", "PENDING", "CONNECTED", "COMPLETED", "FAILED", "IGNORED", "DISQUALIFIED"]).default("DISCOVERED"),
        campaignId: z.number().optional(),
        companyId: z.number().optional(),
        connectionMessage: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(leads).values({
        userId: ctx.user.id,
        ...input,
      });
      return { id: Number(result[0].insertId) };
    }),

  updateLead: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["DISCOVERED", "ENRICHED", "QUALIFIED", "DISQUALIFIED", "PENDING", "CONNECTED", "COMPLETED", "FAILED", "IGNORED"]).optional(),
        bayesianScore: z.number().optional(),
        connectionMessage: z.string().optional(),
        followUpMessage: z.string().optional(),
        labeledByUser: z.boolean().optional(),
        userLabel: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(leads).set(data).where(and(eq(leads.id, id), eq(leads.userId, ctx.user.id)));
      return { success: true };
    }),

  deleteLead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(leads).where(and(eq(leads.id, input.id), eq(leads.userId, ctx.user.id)));
      return { success: true };
    }),

  addNote: authedQuery
    .input(z.object({ leadId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      void ctx;
      const db = getDb();
      const result = await db.insert(leadNotes).values({
        leadId: input.leadId,
        content: input.content,
      });
      return { id: Number(result[0].insertId) };
    }),

  getNotes: authedQuery
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(leadNotes)
        .where(eq(leadNotes.leadId, input.leadId))
        .orderBy(desc(leadNotes.createdAt));
    }),

  // Campaigns
  listCampaigns: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, ctx.user.id))
      .orderBy(desc(campaigns.createdAt));
  }),

  createCampaign: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        objective: z.string().optional(),
        targetIndustries: z.string().optional(),
        targetRoles: z.string().optional(),
        targetLocations: z.string().optional(),
        dailyConnectLimit: z.number().default(20),
        weeklyConnectLimit: z.number().default(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(campaigns).values({
        userId: ctx.user.id,
        ...input,
      });
      return { id: Number(result[0].insertId) };
    }),

  // Companies
  listCompanies: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(companies)
      .where(eq(companies.userId, ctx.user.id))
      .orderBy(desc(companies.createdAt));
  }),

  // Scoring
  scoreLead: authedQuery
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Simulate Bayesian scoring
      const score = 0.3 + Math.random() * 0.6;
      const uncertainty = Math.random() * 0.3;
      await db
        .update(leads)
        .set({ bayesianScore: score, bayesianUncert: uncertainty })
        .where(and(eq(leads.id, input.leadId), eq(leads.userId, ctx.user.id)));
      return { score, uncertainty };
    }),

  batchScore: authedQuery
    .input(z.object({ leadIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const results = [];
      for (const leadId of input.leadIds) {
        const score = 0.3 + Math.random() * 0.6;
        const uncertainty = Math.random() * 0.3;
        await db
          .update(leads)
          .set({ bayesianScore: score, bayesianUncert: uncertainty })
          .where(and(eq(leads.id, leadId), eq(leads.userId, ctx.user.id)));
        results.push({ leadId, score, uncertainty });
      }
      return results;
    }),

  // Stats
  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const totalLeads = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.userId, ctx.user.id));
    const statusCounts = await db
      .select({ status: leads.status, count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.userId, ctx.user.id))
      .groupBy(leads.status);
    const avgScore = await db
      .select({ avg: sql<number>`avg(bayesianScore)` })
      .from(leads)
      .where(eq(leads.userId, ctx.user.id));
    return {
      totalLeads: totalLeads[0]?.count || 0,
      statusCounts: statusCounts || [],
      avgScore: avgScore[0]?.avg || 0,
    };
  }),
});
