import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  // User preferences
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  optimalPostHour: int("optimalPostHour").default(9),
  notifyOnPublish: boolean("notifyOnPublish").default(true),
  notifyOnFailure: boolean("notifyOnFailure").default(true),
  weeklyDigest: boolean("weeklyDigest").default(true),
  // Persona
  personaVoice: varchar("personaVoice", { length: 50 }).default("professional"),
  personaTone: varchar("personaTone", { length: 50 }).default("confident"),
  personaVocabulary: varchar("personaVocabulary", { length: 50 }).default("advanced"),
  // LinkedIn OAuth (encrypted tokens stored as text)
  linkedinId: varchar("linkedinId", { length: 255 }),
  linkedinAccessToken: text("linkedinAccessToken"),
  linkedinRefreshToken: text("linkedinRefreshToken"),
  linkedinTokenExpiry: timestamp("linkedinTokenExpiry"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CONTENT ─────────────────────────────────────────────────────────────────

export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  imageAlt: varchar("imageAlt", { length: 255 }),
  hashtags: text("hashtags"),
  mentions: text("mentions"),
  sourceSkill: varchar("sourceSkill", { length: 50 }),
  sourceUrl: text("sourceUrl"),
  linkedinPostId: varchar("linkedinPostId", { length: 255 }),
  impressions: int("impressions").default(0),
  reactions: int("reactions").default(0),
  comments: int("comments").default(0),
  reposts: int("reposts").default(0),
  clicks: int("clicks").default(0),
  engagementRate: float("engagementRate").default(0),
  status: mysqlEnum("status", ["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED", "ARCHIVED"])
    .default("DRAFT")
    .notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const postQueue = mysqlTable("post_queue", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", ["PENDING", "PROCESSING", "PUBLISHED", "FAILED", "CANCELLED"])
    .default("PENDING")
    .notNull(),
  retryCount: int("retryCount").default(0),
  maxRetries: int("maxRetries").default(3),
  nextRetryAt: timestamp("nextRetryAt"),
  sheetsRowId: varchar("sheetsRowId", { length: 50 }),
  sheetsSheetId: varchar("sheetsSheetId", { length: 255 }),
  processedAt: timestamp("processedAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostQueue = typeof postQueue.$inferSelect;

// ─── LEAD CRM (OpenOutreach state machine) ───────────────────────────────────

export const campaigns = mysqlTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  objective: text("objective"),
  targetIndustries: text("targetIndustries"),
  targetRoles: text("targetRoles"),
  targetLocations: text("targetLocations"),
  dailyConnectLimit: int("dailyConnectLimit").default(20),
  weeklyConnectLimit: int("weeklyConnectLimit").default(100),
  dailyMessageLimit: int("dailyMessageLimit").default(10),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;

export const companies = mysqlTable("companies", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  size: varchar("size", { length: 50 }),
  linkedinUrl: text("linkedinUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Company = typeof companies.$inferSelect;

export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  linkedinId: varchar("linkedinId", { length: 255 }),
  linkedinUrl: text("linkedinUrl"),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  headline: text("headline"),
  summary: text("summary"),
  location: varchar("location", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  connectionDegree: int("connectionDegree"),
  profileImageUrl: text("profileImageUrl"),
  skills: text("skills"),
  experience: json("experience"),
  education: json("education"),
  languages: text("languages"),
  followers: int("followers").default(0),
  bayesianScore: float("bayesianScore"),
  bayesianUncert: float("bayesianUncert"),
  labeledByUser: boolean("labeledByUser").default(false),
  userLabel: int("userLabel"),
  status: mysqlEnum("status", [
    "DISCOVERED",
    "ENRICHED",
    "QUALIFIED",
    "DISQUALIFIED",
    "PENDING",
    "CONNECTED",
    "COMPLETED",
    "FAILED",
    "IGNORED",
  ])
    .default("DISCOVERED")
    .notNull(),
  campaignId: bigint("campaignId", { mode: "number", unsigned: true }),
  companyId: bigint("companyId", { mode: "number", unsigned: true }),
  connectionRequestSentAt: timestamp("connectionRequestSentAt"),
  connectionAcceptedAt: timestamp("connectionAcceptedAt"),
  followUpSentAt: timestamp("followUpSentAt"),
  nextCheckAt: timestamp("nextCheckAt"),
  checkCount: int("checkCount").default(0),
  connectionMessage: text("connectionMessage"),
  followUpMessage: text("followUpMessage"),
  aiGeneratedMessage: text("aiGeneratedMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export const leadNotes = mysqlTable("lead_notes", {
  id: serial("id").primaryKey(),
  leadId: bigint("leadId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadNote = typeof leadNotes.$inferSelect;

export const deals = mysqlTable("deals", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  leadId: bigint("leadId", { mode: "number", unsigned: true }).notNull(),
  companyId: bigint("companyId", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  value: float("value"),
  stage: mysqlEnum("stage", [
    "PROSPECT",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "CLOSED_WON",
    "CLOSED_LOST",
  ])
    .default("PROSPECT")
    .notNull(),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Deal = typeof deals.$inferSelect;

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export const analyticsEvents = mysqlTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  postId: bigint("postId", { mode: "number", unsigned: true }),
  eventType: varchar("eventType", { length: 50 }).notNull(),
  value: int("value").default(1),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ─── DM INBOX ────────────────────────────────────────────────────────────────

export const dmMessages = mysqlTable("dm_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  linkedinThreadId: varchar("linkedinThreadId", { length: 255 }),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderLinkedinId: varchar("senderLinkedinId", { length: 255 }),
  preview: text("preview"),
  spamScore: float("spamScore").default(0),
  responseRate: float("responseRate"),
  lastActiveDays: int("lastActiveDays"),
  isSpam: boolean("isSpam").default(false),
  isPruned: boolean("isPruned").default(false),
  receivedAt: timestamp("receivedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DmMessage = typeof dmMessages.$inferSelect;

// ─── CHAT MESSAGES ───────────────────────────────────────────────────────────

export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  intent: varchar("intent", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
