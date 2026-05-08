import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { posts, leads } from "@db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export const analyticsRouter = createRouter({
  getDashboardStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.userId, ctx.user.id));

    const publishedPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(eq(posts.userId, ctx.user.id), eq(posts.status, "PUBLISHED")));

    const totalLeads = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.userId, ctx.user.id));

    const connectedLeads = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(and(eq(leads.userId, ctx.user.id), eq(leads.status, "CONNECTED")));

    const impressions = await db
      .select({ sum: sql<number>`coalesce(sum(impressions), 0)` })
      .from(posts)
      .where(eq(posts.userId, ctx.user.id));

    const reactions = await db
      .select({ sum: sql<number>`coalesce(sum(reactions), 0)` })
      .from(posts)
      .where(eq(posts.userId, ctx.user.id));

    const comments = await db
      .select({ sum: sql<number>`coalesce(sum(comments), 0)` })
      .from(posts)
      .where(eq(posts.userId, ctx.user.id));

    const reposts = await db
      .select({ sum: sql<number>`coalesce(sum(reposts), 0)` })
      .from(posts)
      .where(eq(posts.userId, ctx.user.id));

    return {
      totalPosts: totalPosts[0]?.count || 0,
      publishedPosts: publishedPosts[0]?.count || 0,
      totalLeads: totalLeads[0]?.count || 0,
      connectedLeads: connectedLeads[0]?.count || 0,
      totalImpressions: impressions[0]?.sum || 0,
      totalReactions: reactions[0]?.sum || 0,
      totalComments: comments[0]?.sum || 0,
      totalReposts: reposts[0]?.sum || 0,
      engagementRate: impressions[0]?.sum
        ? (((reactions[0]?.sum || 0) + (comments[0]?.sum || 0) + (reposts[0]?.sum || 0)) / impressions[0]?.sum * 100).toFixed(2)
        : "0.00",
    };
  }),

  getEngagementData: authedQuery
    .input(z.object({ period: z.enum(["7d", "30d", "90d"]).default("30d") }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const days = input.period === "7d" ? 7 : input.period === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const postData = await db
        .select({
          id: posts.id,
          content: posts.content,
          publishedAt: posts.publishedAt,
          impressions: posts.impressions,
          reactions: posts.reactions,
          comments: posts.comments,
          reposts: posts.reposts,
          clicks: posts.clicks,
          engagementRate: posts.engagementRate,
        })
        .from(posts)
        .where(
          and(
            eq(posts.userId, ctx.user.id),
            eq(posts.status, "PUBLISHED"),
            gte(posts.publishedAt, startDate),
          ),
        )
        .orderBy(desc(posts.publishedAt));

      return postData;
    }),

  getLeadPipelineData: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const pipelineData = await db
      .select({
        status: leads.status,
        count: sql<number>`count(*)`,
        avgScore: sql<number>`coalesce(avg(bayesianScore), 0)`,
      })
      .from(leads)
      .where(eq(leads.userId, ctx.user.id))
      .groupBy(leads.status);

    return pipelineData;
  }),

  getTopPosts: authedQuery
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(posts)
        .where(and(eq(posts.userId, ctx.user.id), eq(posts.status, "PUBLISHED")))
        .orderBy(desc(posts.engagementRate))
        .limit(input.limit);
    }),

  exportCsv: authedQuery
    .input(z.object({ type: z.enum(["posts", "leads"]).default("posts") }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (input.type === "posts") {
        const data = await db
          .select()
          .from(posts)
          .where(eq(posts.userId, ctx.user.id))
          .orderBy(desc(posts.createdAt));
        return data;
      } else {
        const data = await db
          .select()
          .from(leads)
          .where(eq(leads.userId, ctx.user.id))
          .orderBy(desc(leads.createdAt));
        return data;
      }
    }),
});
