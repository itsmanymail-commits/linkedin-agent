import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { posts, postQueue } from "@db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export const contentRouter = createRouter({
  listPosts: authedQuery
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(posts.userId, ctx.user.id)];
      if (input.status) {
        conditions.push(eq(posts.status, input.status as "DRAFT" | "SCHEDULED" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "ARCHIVED"));
      }
      const items = await db
        .select()
        .from(posts)
        .where(and(...conditions))
        .orderBy(desc(posts.createdAt))
        .limit(input.limit)
        .offset((input.page - 1) * input.limit);
      return items;
    }),

  createPost: authedQuery
    .input(
      z.object({
        content: z.string().min(1),
        imageUrl: z.string().optional(),
        imageAlt: z.string().optional(),
        hashtags: z.string().optional(),
        mentions: z.string().optional(),
        sourceSkill: z.string().optional(),
        sourceUrl: z.string().optional(),
        status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(posts).values({
        userId: ctx.user.id,
        ...input,
      });
      return { id: Number(result[0].insertId) };
    }),

  updatePost: authedQuery
    .input(
      z.object({
        id: z.number(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        hashtags: z.string().optional(),
        status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED", "ARCHIVED"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(posts).set(data).where(and(eq(posts.id, id), eq(posts.userId, ctx.user.id)));
      return { success: true };
    }),

  deletePost: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(posts).where(and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)));
      return { success: true };
    }),

  schedulePost: authedQuery
    .input(
      z.object({
        postId: z.number(),
        scheduledAt: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Update post status
      await db
        .update(posts)
        .set({ status: "SCHEDULED" })
        .where(and(eq(posts.id, input.postId), eq(posts.userId, ctx.user.id)));
      // Add to queue
      await db.insert(postQueue).values({
        userId: ctx.user.id,
        postId: input.postId,
        scheduledAt: new Date(input.scheduledAt),
        status: "PENDING",
      });
      return { success: true };
    }),

  getQueue: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db
      .select()
      .from(postQueue)
      .where(eq(postQueue.userId, ctx.user.id))
      .orderBy(asc(postQueue.scheduledAt));
    return items;
  }),

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const totalPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.userId, ctx.user.id));
    const publishedPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(eq(posts.userId, ctx.user.id), eq(posts.status, "PUBLISHED")));
    const scheduledPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(eq(posts.userId, ctx.user.id), eq(posts.status, "SCHEDULED")));
    const totalImpressions = await db
      .select({ sum: sql<number>`sum(impressions)` })
      .from(posts)
      .where(eq(posts.userId, ctx.user.id));
    return {
      totalPosts: totalPosts[0]?.count || 0,
      publishedPosts: publishedPosts[0]?.count || 0,
      scheduledPosts: scheduledPosts[0]?.count || 0,
      totalImpressions: totalImpressions[0]?.sum || 0,
    };
  }),
});
