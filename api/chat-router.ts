import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Simple intent detection based on keywords
function detectIntent(content: string): string {
  const lower = content.toLowerCase();
  if (lower.startsWith("#post") || lower.includes("write a post") || lower.includes("create content")) {
    return "post_writer";
  }
  if (lower.startsWith("#dm") || lower.includes("message") || lower.includes("draft a dm") || lower.includes("connection request")) {
    return "dm_composer";
  }
  if (lower.includes("audit") || lower.includes("profile") || lower.includes("improve my")) {
    return "profile_auditor";
  }
  if (lower.includes("trend") || lower.includes("trending") || lower.includes("what's popular")) {
    return "trend_analyst";
  }
  if (lower.includes("score leads") || lower.includes("crm") || lower.includes("lead score")) {
    return "lead_scorer";
  }
  if (lower.includes("analytics") || lower.includes("stats") || lower.includes("performance")) {
    return "analytics_reader";
  }
  if (lower.startsWith("#audit")) {
    return "profile_auditor";
  }
  return "conversational";
}

// Generate AI response based on intent
function generateResponse(content: string, intent: string): string {
  const lower = content.toLowerCase();

  switch (intent) {
    case "post_writer": {
      if (lower.includes("url") || lower.includes("link") || lower.includes("http")) {
        return "I'll extract the key points from that URL and draft a high-engagement LinkedIn post. Here's a hook + key takeaway format:\n\n**Hook:** The biggest misconception about this topic? Most people get it completely wrong.\n\n**Body:** [Extracted insights from your URL]\n\n**CTA:** What's your experience with this? Drop a comment below.\n\nWould you like me to refine the tone or add specific hashtags?";
      }
      return "I'll craft a LinkedIn post for you. Here's a draft:\n\n**Hook:** I learned this lesson the hard way so you don't have to.\n\n**Body:** After 100+ experiments in this space, one pattern emerged crystal clear: consistency beats intensity every single time.\n\nThe compound effect of small daily actions creates results that no sprint can match.\n\n**CTA:** Agree or disagree? Let's discuss in the comments.\n\n---\n*Want me to adjust the tone, length, or generate hashtags?*";
    }
    case "dm_composer": {
      return "I'll draft a personalized connection request. Here's one approach:\n\n*Hi [Name], I came across your profile while researching [topic]. Your experience with [specific detail] really stood out. I'd love to connect and exchange insights on [shared interest].*\n\n**Follow-up template (24h after acceptance):**\n*Thanks for connecting, [Name]! I noticed we're both focused on [area]. I'd love to hear your thoughts on [specific question].*\n\nWant me to customize this further with specific profile data?";
    }
    case "profile_auditor": {
      return "Here's your LinkedIn profile audit across 8 key sections:\n\n**1. Headline** - Score: 7/10\n*Suggestion:* Add a specific outcome or metric you deliver\n\n**2. Summary/About** - Score: 6/10\n*Suggestion:* Lead with a compelling story, not your job title\n\n**3. Experience** - Score: 8/10\n*Suggestion:* Add 2-3 quantified achievements per role\n\n**4. Skills** - Score: 7/10\n*Suggestion:* Pin your top 3 most relevant skills\n\n**5. Photo** - Score: 8/10\n*Suggestion:* Great quality, ensure background is clean\n\n**6. Banner** - Score: 5/10\n*Suggestion:* Add a custom banner with your value proposition\n\n**7. Featured** - Score: 4/10\n*Suggestion:* Pin your best post or media appearance\n\n**8. Activity** - Score: 6/10\n*Suggestion:* Post 2-3x per week for optimal visibility\n\n**Overall Score: 6.4/10** - Solid foundation with room for optimization!";
    }
    case "trend_analyst": {
      return "Here are the trending topics in your niche this week:\n\n**1. AI-Powered Personalization**\n- Engagement up 34%\n- Post idea: *How I used AI to 3x my outreach response rate*\n\n**2. Remote Team Culture**\n- Engagement up 22%\n- Post idea: *The 3 rituals that keep our distributed team aligned*\n\n**3. Thought Leadership Over Promotion**\n- Engagement up 41%\n- Post idea: *Why I stopped selling and started teaching (and revenue doubled)*\n\n**4. Data-Driven Decision Making**\n- Engagement up 18%\n- Post idea: *The one metric that actually predicts customer retention*\n\n**5. Async Communication**\n- Engagement up 27%\n- Post idea: *We cut meetings by 70% using this async framework*\n\nWould you like me to draft a post on any of these trends?";
    }
    case "lead_scorer": {
      return "I've analyzed your lead pipeline using Bayesian scoring. Here's the breakdown:\n\n**High Priority (Score > 0.7):** 12 leads\n- Connection acceptance probability: 72-89%\n- Recommended action: Send personalized connection requests\n\n**Medium Priority (Score 0.4-0.7):** 24 leads\n- Connection acceptance probability: 45-68%\n- Recommended action: Enrich profiles with more data before outreach\n\n**Low Priority (Score < 0.4):** 8 leads\n- Connection acceptance probability: 15-38%\n- Recommended action: Move to nurture sequence or archive\n\n**BALD Active Learning Suggestion:**\nLabel 5 un-scored leads manually to improve model accuracy by ~18%.\n\nWould you like me to score specific leads or suggest keywords for discovery?";
    }
    case "analytics_reader": {
      return "Here's your analytics summary for the last 30 days:\n\n**Posts Published:** 12\n**Total Impressions:** 24,500 (+18% vs last month)\n**Total Reactions:** 1,240 (+12%)\n**Comments:** 186 (+24%)\n**Reposts:** 92 (+31%)\n**Clicks:** 448 (+15%)\n**Avg. Engagement Rate:** 4.2% (above industry avg of 2.8%)\n\n**Top Performing Post:** The biggest myth about LinkedIn growth - 3,200 impressions, 156 reactions\n\n**Insights:**\n- Posts published at 9 AM get 28% more engagement\n- Story-format posts outperform listicles by 34%\n- Posts with images get 2.1x more reactions\n\n**Recommendation:** Focus on story-format posts with custom images, published between 8-10 AM your local time.";
    }
    default: {
      return "I'm your LinkAgent AI assistant, here to help you grow on LinkedIn. I can help you with:\n\n- **Content Creation** - Write posts, edit drafts, check facts (#Post)\n- **Lead Management** - Score leads, discover prospects, compose DMs (#DM)\n- **Profile Optimization** - Audit your profile, suggest improvements\n- **Trend Analysis** - Find trending topics, get post ideas\n- **Analytics** - Review performance, export data\n\nJust tell me what you'd like to do, or use tags like #Post, #DM, or #Audit to jump straight to a feature. What would you like to work on?";
    }
  }
}

export const chatRouter = createRouter({
  getHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, ctx.user.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(100);
  }),

  sendMessage: authedQuery
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Save user message
      await db.insert(chatMessages).values({
        userId: ctx.user.id,
        role: "user",
        content: input.content,
      });

      // Detect intent
      const intent = detectIntent(input.content);

      // Generate AI response
      const response = generateResponse(input.content, intent);

      // Save AI response
      await db.insert(chatMessages).values({
        userId: ctx.user.id,
        role: "assistant",
        content: response,
        intent,
      });

      return { response, intent };
    }),

  clearHistory: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.delete(chatMessages).where(eq(chatMessages.userId, ctx.user.id));
    return { success: true };
  }),
});
