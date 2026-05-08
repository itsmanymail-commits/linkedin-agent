import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  getProfile: authedQuery.query(async ({ ctx }) => {
    return ctx.user;
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().optional(),
        timezone: z.string().optional(),
        optimalPostHour: z.number().min(0).max(23).optional(),
        notifyOnPublish: z.boolean().optional(),
        notifyOnFailure: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  updatePersona: authedQuery
    .input(
      z.object({
        personaVoice: z.enum(["professional", "casual", "thought_leader", "storyteller"]).optional(),
        personaTone: z.enum(["confident", "humble", "energetic", "calm"]).optional(),
        personaVocabulary: z.enum(["simple", "advanced", "technical", "conversational"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
