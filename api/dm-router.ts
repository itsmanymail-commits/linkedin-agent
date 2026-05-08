import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dmMessages } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const dmRouter = createRouter({
  listMessages: authedQuery
    .input(
      z.object({
        filter: z.enum(["all", "clean", "suspicious", "spam"]).default("all"),
        page: z.number().default(1),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(dmMessages.userId, ctx.user.id)];

      if (input.filter === "spam") {
        conditions.push(eq(dmMessages.isSpam, true));
      } else if (input.filter === "suspicious") {
        conditions.push(
          sql`${dmMessages.spamScore} >= 0.3 AND ${dmMessages.spamScore} < 0.6`,
        );
      } else if (input.filter === "clean") {
        conditions.push(sql`${dmMessages.spamScore} < 0.3`);
      }

      const items = await db
        .select()
        .from(dmMessages)
        .where(and(...conditions))
        .orderBy(desc(dmMessages.receivedAt))
        .limit(input.limit)
        .offset((input.page - 1) * input.limit);

      return items;
    }),

  getInboxHealth: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const totalMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(dmMessages)
      .where(eq(dmMessages.userId, ctx.user.id));

    const spamCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(dmMessages)
      .where(and(eq(dmMessages.userId, ctx.user.id), eq(dmMessages.isSpam, true)));

    const suspiciousCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(dmMessages)
      .where(
        and(
          eq(dmMessages.userId, ctx.user.id),
          sql`${dmMessages.spamScore} >= 0.3 AND ${dmMessages.spamScore} < 0.6`,
        ),
      );

    const cleanCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(dmMessages)
      .where(and(eq(dmMessages.userId, ctx.user.id), sql`${dmMessages.spamScore} < 0.3`));

    const avgSpamScore = await db
      .select({ avg: sql<number>`coalesce(avg(spamScore), 0)` })
      .from(dmMessages)
      .where(eq(dmMessages.userId, ctx.user.id));

    const total = totalMessages[0]?.count || 0;
    const spam = spamCount[0]?.count || 0;
    const suspicious = suspiciousCount[0]?.count || 0;
    const clean = cleanCount[0]?.count || 0;

    // Calculate health score (0-100)
    const healthScore = total > 0 ? Math.round(((clean + suspicious * 0.5) / total) * 100) : 100;

    return {
      totalMessages: total,
      spamMessages: spam,
      suspiciousMessages: suspicious,
      cleanMessages: clean,
      avgSpamScore: avgSpamScore[0]?.avg || 0,
      healthScore,
      healthStatus: healthScore >= 80 ? "healthy" : healthScore >= 50 ? "moderate" : "poor",
    };
  }),

  pruneSpam: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(dmMessages)
      .set({ isPruned: true })
      .where(
        and(
          eq(dmMessages.userId, ctx.user.id),
          eq(dmMessages.isSpam, true),
        ),
      );
    return { success: true };
  }),

  markAsSpam: authedQuery
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(dmMessages)
        .set({ isSpam: true, spamScore: 1.0 })
        .where(
          and(
            eq(dmMessages.id, input.messageId),
            eq(dmMessages.userId, ctx.user.id),
          ),
        );
      return { success: true };
    }),

  seedSampleData: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const sampleMessages = [
      { senderName: "Sarah Chen", preview: "Hi! I noticed your work in AI. Would love to connect and discuss potential collaboration opportunities.", spamScore: 0.15, isSpam: false, lastActiveDays: 2 },
      { senderName: "Sales Pro 3000", preview: "BUY MY COURSE!!! 99% OFF TODAY ONLY!!! Click here to 10x your income overnight!!!", spamScore: 0.95, isSpam: true, lastActiveDays: 0 },
      { senderName: "Mark Johnson", preview: "Thanks for connecting! I enjoyed your recent post about leadership. Would you be open to a quick call?", spamScore: 0.25, isSpam: false, lastActiveDays: 5 },
      { senderName: "LinkedIn Bot", preview: "Automated message: I see we share connections. Let's grow our networks together!", spamScore: 0.78, isSpam: true, lastActiveDays: 1 },
      { senderName: "Jessica Park", preview: "Great article you shared! I wrote something similar on my blog. Check it out here...", spamScore: 0.45, isSpam: false, lastActiveDays: 3 },
      { senderName: "Crypto King", preview: "Revolutionary blockchain opportunity! Get in early on the next Bitcoin! DM me for details.", spamScore: 0.92, isSpam: true, lastActiveDays: 0 },
      { senderName: "David Miller", preview: "Hello, I'm hiring for a senior role at my company. Your profile looks like a great fit. Interested?", spamScore: 0.35, isSpam: false, lastActiveDays: 1 },
      { senderName: "Growth Hacker", preview: "I can get you 10k followers in 30 days guaranteed! Limited spots available. Reply YES.", spamScore: 0.88, isSpam: true, lastActiveDays: 0 },
    ];

    for (const msg of sampleMessages) {
      await db.insert(dmMessages).values({
        userId: ctx.user.id,
        senderName: msg.senderName,
        preview: msg.preview,
        spamScore: msg.spamScore,
        isSpam: msg.isSpam,
        lastActiveDays: msg.lastActiveDays,
        receivedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    return { success: true, count: sampleMessages.length };
  }),
});
