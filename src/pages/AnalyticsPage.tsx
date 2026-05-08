import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import {
  Download,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MousePointer,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data: stats } = trpc.analytics.getDashboardStats.useQuery();
  const { data: engagementData } = trpc.analytics.getEngagementData.useQuery({ period });
  const { data: topPosts } = trpc.analytics.getTopPosts.useQuery({ limit: 5 });
  const { data: pipelineData } = trpc.analytics.getLeadPipelineData.useQuery();

  const handleExportCsv = (type: "posts" | "leads") => {
    if (type === "posts" && engagementData) {
      const headers = ["ID", "Content", "Published At", "Impressions", "Reactions", "Comments", "Reposts", "Clicks", "Engagement Rate"];
      const rows = engagementData.map((post) => [
        post.id,
        `"${(post.content || "").replace(/"/g, '""').slice(0, 200)}"`,
        post.publishedAt ? new Date(post.publishedAt).toISOString() : "",
        post.impressions,
        post.reactions,
        post.comments,
        post.reposts,
        post.clicks,
        post.engagementRate,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkagent-posts-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Compute chart data
  const chartData = useMemo(() => {
    if (!engagementData) return [];
    // Group by date
    const grouped: Record<string, { impressions: number; reactions: number; comments: number; reposts: number }> = {};
    engagementData.forEach((post) => {
      if (!post.publishedAt) return;
      const date = new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!grouped[date]) grouped[date] = { impressions: 0, reactions: 0, comments: 0, reposts: 0 };
      grouped[date].impressions += post.impressions || 0;
      grouped[date].reactions += post.reactions || 0;
      grouped[date].comments += post.comments || 0;
      grouped[date].reposts += post.reposts || 0;
    });
    return Object.entries(grouped).map(([date, vals]) => ({ date, ...vals }));
  }, [engagementData]);

  const maxImpressions = Math.max(...chartData.map((d) => d.impressions), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#EAF4F4" }}>Analytics Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            Engagement tracking, performance metrics, and data export
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(234, 244, 244, 0.1)" }}>
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-2 text-xs font-medium transition-all"
                style={{
                  background: period === p ? "rgba(78, 168, 222, 0.15)" : "transparent",
                  color: period === p ? "#4EA8DE" : "rgba(234, 244, 244, 0.5)",
                }}
              >
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
          <button onClick={() => handleExportCsv("posts")} className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="w-3 h-3" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Impressions", value: stats?.totalImpressions?.toLocaleString() || "0", icon: Eye, color: "#4EA8DE", delta: "+18%" },
          { label: "Reactions", value: stats?.totalReactions?.toLocaleString() || "0", icon: Heart, color: "#e66363", delta: "+12%" },
          { label: "Comments", value: stats?.totalComments?.toLocaleString() || "0", icon: MessageCircle, color: "#63e696", delta: "+24%" },
          { label: "Reposts", value: stats?.totalReposts?.toLocaleString() || "0", icon: Share2, color: "#a78bfa", delta: "+31%" },
          { label: "Clicks", value: stats?.totalImpressions ? (stats.totalImpressions * 0.02).toFixed(0) : "0", icon: MousePointer, color: "#F4A261", delta: "+8%" },
          { label: "Eng. Rate", value: `${stats?.engagementRate || "0"}%`, icon: TrendingUp, color: "#34d399", delta: "+5%" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" style={{ color: "#63e696" }} />
                <span className="text-[10px] font-medium" style={{ color: "#63e696" }}>{kpi.delta}</span>
              </div>
            </div>
            <p className="kpi-value text-xl">{kpi.value}</p>
            <p className="kpi-label">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts + Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#EAF4F4" }}>
            Engagement Over Time
          </h3>
          {chartData.length > 0 ? (
            <div className="space-y-6">
              {/* Impressions Bar Chart */}
              <div>
                <p className="text-xs font-medium mb-3" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Impressions</p>
                <div className="flex items-end gap-1.5 h-32">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all hover:opacity-80"
                        style={{
                          height: `${(d.impressions / maxImpressions) * 100}%`,
                          background: "linear-gradient(to top, #4EA8DE, #3d8bc4)",
                          minHeight: 4,
                        }}
                        title={`${d.date}: ${d.impressions.toLocaleString()} impressions`}
                      />
                      <span className="text-[8px] mono" style={{ color: "rgba(234, 244, 244, 0.3)" }}>
                        {d.date.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reactions + Comments */}
              <div>
                <p className="text-xs font-medium mb-3" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Reactions & Comments</p>
                <div className="flex items-end gap-1.5 h-24">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5">
                        <div
                          className="flex-1 rounded-t"
                          style={{ height: `${Math.min((d.reactions / Math.max(...chartData.map(x => x.reactions), 1)) * 100, 100)}%`, background: "#e66363", minHeight: 2 }}
                        />
                        <div
                          className="flex-1 rounded-t"
                          style={{ height: `${Math.min((d.comments / Math.max(...chartData.map(x => x.comments), 1)) * 100, 100)}%`, background: "#63e696", minHeight: 2 }}
                        />
                      </div>
                      <span className="text-[8px] mono" style={{ color: "rgba(234, 244, 244, 0.3)" }}>
                        {d.date.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#e66363" }} />
                    <span className="text-[10px]" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Reactions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#63e696" }} />
                    <span className="text-[10px]" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Comments</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(234, 244, 244, 0.2)" }} />
              <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>No engagement data yet. Publish some posts to see analytics.</p>
            </div>
          )}
        </div>

        {/* Top Posts */}
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#EAF4F4" }}>Top Posts</h3>
          <div className="space-y-3">
            {topPosts && topPosts.length > 0 ? (
              topPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg"
                  style={{ background: "rgba(234, 244, 244, 0.03)", border: "1px solid rgba(234, 244, 244, 0.06)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs mono font-bold" style={{ color: "#4EA8DE" }}>#{idx + 1}</span>
                    <span className="text-[10px]" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: "#EAF4F4" }}>
                    {post.content.slice(0, 120)}...
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                      <Eye className="w-3 h-3" /> {post.impressions}
                    </span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                      <Heart className="w-3 h-3" /> {post.reactions}
                    </span>
                    <span className="text-[10px] mono font-bold ml-auto" style={{ color: "#63e696" }}>
                      {post.engagementRate ? (post.engagementRate * 100).toFixed(1) : "0.0"}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>No published posts yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Pipeline Chart */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#EAF4F4" }}>Lead Pipeline Distribution</h3>
        <div className="flex items-center gap-2 h-10">
          {pipelineData && pipelineData.length > 0 ? (
            pipelineData.map((stage) => {
              const total = pipelineData.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? (stage.count / total) * 100 : 0;
              const statusColors: Record<string, string> = {
                DISCOVERED: "#4E8098", ENRICHED: "#4EA8DE", QUALIFIED: "#a78bfa",
                PENDING: "#F4A261", CONNECTED: "#63e696", COMPLETED: "#34d399",
                DISQUALIFIED: "#e66363", FAILED: "#ef4444", IGNORED: "#6b7280",
              };
              return (
                <div
                  key={stage.status}
                  className="h-full rounded-md transition-all hover:opacity-80 relative group"
                  style={{ width: `${Math.max(pct, 5)}%`, background: statusColors[stage.status] || "#4E8098" }}
                  title={`${stage.status}: ${stage.count} leads`}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="glass-panel px-2 py-1 text-[10px] whitespace-nowrap" style={{ color: "#EAF4F4" }}>
                      {stage.status}: {stage.count}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center text-sm py-4" style={{ color: "rgba(234, 244, 244, 0.5)" }}>No lead data available</div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {pipelineData?.map((stage) => {
            const statusColors: Record<string, string> = {
              DISCOVERED: "#4E8098", ENRICHED: "#4EA8DE", QUALIFIED: "#a78bfa",
              PENDING: "#F4A261", CONNECTED: "#63e696", COMPLETED: "#34d399",
              DISQUALIFIED: "#e66363", FAILED: "#ef4444", IGNORED: "#6b7280",
            };
            return (
              <div key={stage.status} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: statusColors[stage.status] || "#4E8098" }} />
                <span className="text-[10px]" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                  {stage.status} ({stage.count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
