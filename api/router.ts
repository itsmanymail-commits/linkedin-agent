import { authRouter } from "./auth-router";
import { contentRouter } from "./content-router";
import { leadRouter } from "./lead-router";
import { chatRouter } from "./chat-router";
import { analyticsRouter } from "./analytics-router";
import { dmRouter } from "./dm-router";
import { settingsRouter } from "./settings-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  content: contentRouter,
  lead: leadRouter,
  chat: chatRouter,
  analytics: analyticsRouter,
  dm: dmRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
