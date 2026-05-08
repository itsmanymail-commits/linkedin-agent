import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  Activity,
  Calendar,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react";

function KPICard({
  title,
  value,
  delta,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  delta?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="kpi-card animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="kpi-label">{title}</p>
          <p className="kpi-value">{value}</p>
          {delta && (
            <p className={`kpi-delta ${delta.startsWith("+") ? "positive" : "negative"}`}>
              {delta} vs last month
            </p>
          )}
        </div>
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { data: contentStats } = trpc.content.getStats.useQuery();
  const { data: leadStats } = trpc.lead.getStats.useQuery();
  const { data: analyticsStats } = trpc.analytics.getDashboardStats.useQuery();
  const { data: recentPosts } = trpc.content.listPosts.useQuery({ page: 1, limit: 5 });

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(78, 168, 222, 0.15), rgba(78, 128, 152, 0.1))",
          border: "1px solid rgba(78, 168, 222, 0.2)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: "#4EA8DE" }} />
            <span className="text-sm font-medium" style={{ color: "#4EA8DE" }}>
              AI-Powered LinkedIn Growth
            </span>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: "#EAF4F4" }}>
            Welcome back to LinkAgent AI
          </h1>
          <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
            Your intelligent assistant for content creation, lead management, and analytics — powered by MiniMax M2.7
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Posts"
          value={contentStats?.totalPosts || 0}
          delta="+18%"
          icon={FileText}
          color="#4EA8DE"
        />
        <KPICard
          title="Total Leads"
          value={leadStats?.totalLeads || 0}
          delta="+24%"
          icon={Users}
          color="#63e696"
        />
        <KPICard
          title="Impressions"
          value={analyticsStats?.totalImpressions?.toLocaleString() || "0"}
          delta="+31%"
          icon={Eye}
          color="#F4A261"
        />
        <KPICard
          title="Engagement Rate"
          value={`${analyticsStats?.engagementRate || "0"}%`}
          delta="+12%"
          icon={TrendingUp}
          color="#a78bfa"
        />
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#EAF4F4" }}>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/content-studio")}
              className="flex items-center gap-3 w-full p-3 rounded-lg transition-all"
              style={{ background: "rgba(78, 168, 222, 0.08)", border: "1px solid rgba(78, 168, 222, 0.15)" }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "rgba(78, 168, 222, 0.15)" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#4EA8DE" }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: "#EAF4F4" }}>AI Post Writer</p>
                <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Generate content from any topic</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto" style={{ color: "rgba(234, 244, 244, 0.3)" }} />
            </button>

            <button
              onClick={() => navigate("/ai-chat")}
              className="flex items-center gap-3 w-full p-3 rounded-lg transition-all"
              style={{ background: "rgba(99, 230, 150, 0.05)", border: "1px solid rgba(99, 230, 150, 0.1)" }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "rgba(99, 230, 150, 0.1)" }}>
                <Target className="w-4 h-4" style={{ color: "#63e696" }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: "#EAF4F4" }}>AI Chat Assistant</p>
                <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Intent detection & smart routing</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto" style={{ color: "rgba(234, 244, 244, 0.3)" }} />
            </button>

            <button
              onClick={() => navigate("/lead-crm")}
              className="flex items-center gap-3 w-full p-3 rounded-lg transition-all"
              style={{ background: "rgba(167, 139, 250, 0.05)", border: "1px solid rgba(167, 139, 250, 0.1)" }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "rgba(167, 139, 250, 0.1)" }}>
                <Users className="w-4 h-4" style={{ color: "#a78bfa" }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: "#EAF4F4" }}>Lead CRM</p>
                <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>6-state Kanban pipeline</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto" style={{ color: "rgba(234, 244, 244, 0.3)" }} />
            </button>

            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center gap-3 w-full p-3 rounded-lg transition-all"
              style={{ background: "rgba(244, 162, 97, 0.05)", border: "1px solid rgba(244, 162, 97, 0.1)" }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "rgba(244, 162, 97, 0.1)" }}>
                <BarChart3 className="w-4 h-4" style={{ color: "#F4A261" }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: "#EAF4F4" }}>Analytics</p>
                <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Engagement & performance</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto" style={{ color: "rgba(234, 244, 244, 0.3)" }} />
            </button>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>
              Recent Content
            </h3>
            <button
              onClick={() => navigate("/content-studio")}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: "#4EA8DE" }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentPosts && recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ background: "rgba(234, 244, 244, 0.03)", border: "1px solid rgba(234, 244, 244, 0.06)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#EAF4F4" }}>
                      {post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="badge" style={{
                        background: post.status === "PUBLISHED" ? "rgba(99, 230, 150, 0.15)" : post.status === "SCHEDULED" ? "rgba(78, 168, 222, 0.15)" : "rgba(78, 128, 152, 0.2)",
                        color: post.status === "PUBLISHED" ? "#63e696" : post.status === "SCHEDULED" ? "#4EA8DE" : "#4E8098",
                      }}>
                        {post.status}
                      </span>
                      {post.sourceSkill && (
                        <span className="text-xs" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                          via {post.sourceSkill}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-semibold mono" style={{ color: "#EAF4F4" }}>{post.impressions}</p>
                      <p className="text-[10px]" style={{ color: "rgba(234, 244, 244, 0.4)" }}>Impressions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold mono" style={{ color: "#EAF4F4" }}>{post.reactions}</p>
                      <p className="text-[10px]" style={{ color: "rgba(234, 244, 244, 0.4)" }}>Reactions</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(234, 244, 244, 0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                  No posts yet. Create your first post in the Content Studio.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Pipeline Overview */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>
            Lead Pipeline Overview
          </h3>
          <button
            onClick={() => navigate("/lead-crm")}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "#4EA8DE" }}
          >
            Open CRM <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "DISCOVERED", color: "#4E8098", count: leadStats?.statusCounts?.find(s => s.status === "DISCOVERED")?.count || 0 },
            { label: "ENRICHED", color: "#4EA8DE", count: leadStats?.statusCounts?.find(s => s.status === "ENRICHED")?.count || 0 },
            { label: "QUALIFIED", color: "#a78bfa", count: leadStats?.statusCounts?.find(s => s.status === "QUALIFIED")?.count || 0 },
            { label: "PENDING", color: "#F4A261", count: leadStats?.statusCounts?.find(s => s.status === "PENDING")?.count || 0 },
            { label: "CONNECTED", color: "#63e696", count: leadStats?.statusCounts?.find(s => s.status === "CONNECTED")?.count || 0 },
            { label: "COMPLETED", color: "#34d399", count: leadStats?.statusCounts?.find(s => s.status === "COMPLETED")?.count || 0 },
          ].map((stage) => (
            <div
              key={stage.label}
              className="text-center p-4 rounded-lg"
              style={{ background: `${stage.color}10`, border: `1px solid ${stage.color}30` }}
            >
              <p className="text-lg font-bold mono" style={{ color: stage.color }}>{stage.count}</p>
              <p className="text-[10px] font-medium mt-1 uppercase tracking-wider" style={{ color: `${stage.color}cc` }}>
                {stage.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#EAF4F4" }}>
            System Status
          </h3>
          <div className="space-y-3">
            {[
              { label: "AI Chat Assistant", status: "Online", icon: Activity, color: "#63e696" },
              { label: "Post Scheduler", status: "Active", icon: Calendar, color: "#4EA8DE" },
              { label: "Lead Scoring", status: "Running", icon: Target, color: "#a78bfa" },
              { label: "DM Spam Pruner", status: "Ready", icon: FileText, color: "#F4A261" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "rgba(234, 244, 244, 0.03)" }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-sm" style={{ color: "#EAF4F4" }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: item.color }} />
                  <span className="text-xs font-medium" style={{ color: item.color }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#EAF4F4" }}>
            20 AI Skills & Features
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { mod: "Content Studio", feats: "AI post writer, editor, scheduler, sheets queue, URL→post, image gen", color: "#4EA8DE" },
              { mod: "AI Chat", feats: "Intent detection, persona engine, trend analyst, profile auditor", color: "#63e696" },
              { mod: "Lead CRM", feats: "Kanban CRM, Bayesian scorer, BALD learning, AI discovery, DM composer", color: "#a78bfa" },
              { mod: "Analytics", feats: "Engagement dashboard, CSV export, email notifications", color: "#F4A261" },
              { mod: "DM & Inbox", feats: "Spam pruner, inbox health score, message classification", color: "#e66363" },
              { mod: "Infrastructure", feats: "OAuth v2, Docker worker, Vercel Cron, Neon Postgres", color: "#4E8098" },
            ].map((m) => (
              <div key={m.mod} className="p-3 rounded-lg" style={{ background: `${m.color}08`, border: `1px solid ${m.color}20` }}>
                <p className="text-xs font-semibold mb-1" style={{ color: m.color }}>{m.mod}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: "rgba(234, 244, 244, 0.5)" }}>{m.feats}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
