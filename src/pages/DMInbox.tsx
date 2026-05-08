import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Mail,
  Inbox,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Clock,
} from "lucide-react";

type FilterType = "all" | "clean" | "suspicious" | "spam";

export default function DMInbox() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const utils = trpc.useUtils();
  const { data: messages } = trpc.dm.listMessages.useQuery({ filter: activeFilter, page: 1, limit: 50 });
  const { data: health } = trpc.dm.getInboxHealth.useQuery();
  const pruneSpam = trpc.dm.pruneSpam.useMutation({
    onSuccess: () => {
      utils.dm.listMessages.invalidate();
      utils.dm.getInboxHealth.invalidate();
    },
  });
  const markAsSpam = trpc.dm.markAsSpam.useMutation({
    onSuccess: () => {
      utils.dm.listMessages.invalidate();
      utils.dm.getInboxHealth.invalidate();
    },
  });
  const seedData = trpc.dm.seedSampleData.useMutation({
    onSuccess: () => {
      utils.dm.listMessages.invalidate();
      utils.dm.getInboxHealth.invalidate();
      setShowSeedConfirm(false);
    },
  });

  const filters: { id: FilterType; label: string; icon: React.ElementType; color: string }[] = [
    { id: "all", label: "All", icon: Inbox, color: "#4EA8DE" },
    { id: "clean", label: "Clean", icon: CheckCircle, color: "#63e696" },
    { id: "suspicious", label: "Suspicious", icon: AlertTriangle, color: "#F4A261" },
    { id: "spam", label: "Spam", icon: Shield, color: "#e66363" },
  ];

  const healthColor = health?.healthScore && health.healthScore >= 80 ? "#63e696" : health?.healthScore && health.healthScore >= 50 ? "#F4A261" : "#e66363";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#EAF4F4" }}>DM & Inbox</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            Spam pruner, inbox health scoring, and message classification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSeedConfirm(true)}
            className="btn-secondary flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3 h-3" /> Load Sample Data
          </button>
          <button
            onClick={() => pruneSpam.mutate()}
            className="btn-primary flex items-center gap-2 text-xs"
            style={{ background: "rgba(230, 99, 99, 0.2)", color: "#e66363" }}
          >
            <Trash2 className="w-3 h-3" /> Prune Spam
          </button>
        </div>
      </div>

      {/* Health Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${healthColor}15` }}>
              <Shield className="w-5 h-5" style={{ color: healthColor }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>Inbox Health</p>
              <p className="text-2xl font-bold mono" style={{ color: healthColor }}>
                {health?.healthScore || 0}%
              </p>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(78, 128, 152, 0.2)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${health?.healthScore || 0}%`, background: healthColor }}
            />
          </div>
          <p className="text-[10px] mt-2" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
            {health?.healthStatus === "healthy" ? "Your inbox is in great shape" : health?.healthStatus === "moderate" ? "Some spam detected, consider pruning" : "High spam volume detected!"}
          </p>
        </div>

        {[
          { label: "Total Messages", value: health?.totalMessages || 0, icon: Mail, color: "#4EA8DE" },
          { label: "Clean", value: health?.cleanMessages || 0, icon: CheckCircle, color: "#63e696" },
          { label: "Spam", value: health?.spamMessages || 0, icon: Shield, color: "#e66363" },
        ].map((stat) => (
          <div key={stat.label} className="kpi-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>{stat.label}</p>
                <p className="text-lg font-bold mono" style={{ color: "#EAF4F4" }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spam Scoring Info */}
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "#4EA8DE" }} />
          <h3 className="text-sm font-semibold" style={{ color: "#EAF4F4" }}>8-Signal Spam Scoring</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { signal: "Sender Quality", desc: "Profile completeness, connections", status: "active" },
            { signal: "Keyword Analysis", desc: "Spam word detection", status: "active" },
            { signal: "Engagement Signals", desc: "Response rate patterns", status: "active" },
            { signal: "Connection Degree", desc: "1st, 2nd, 3rd degree check", status: "active" },
            { signal: "Message Frequency", desc: "Bulk message detection", status: "active" },
            { signal: "Link Analysis", desc: "Suspicious URL detection", status: "active" },
            { signal: "Template Detection", desc: "Copy-paste patterns", status: "active" },
            { signal: "Timing Patterns", desc: "Unusual send times", status: "active" },
          ].map((sig) => (
            <div
              key={sig.signal}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{ background: "rgba(234, 244, 244, 0.03)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: sig.status === "active" ? "#63e696" : "#4E8098" }} />
              <div>
                <p className="text-[11px] font-medium" style={{ color: "#EAF4F4" }}>{sig.signal}</p>
                <p className="text-[9px]" style={{ color: "rgba(234, 244, 244, 0.4)" }}>{sig.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs + Messages */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeFilter === f.id ? f.color + "15" : "transparent",
                color: activeFilter === f.id ? f.color : "rgba(234, 244, 244, 0.5)",
                border: `1px solid ${activeFilter === f.id ? f.color + "30" : "transparent"}`,
              }}
            >
              <f.icon className="w-3 h-3" />
              {f.label}
              <span className="mono text-[10px]" style={{ opacity: 0.6 }}>
                {f.id === "all" ? health?.totalMessages : f.id === "clean" ? health?.cleanMessages : f.id === "suspicious" ? (health?.totalMessages || 0) - (health?.cleanMessages || 0) - (health?.spamMessages || 0) : health?.spamMessages}
              </span>
            </button>
          ))}
        </div>

        {/* Message List */}
        <div className="space-y-2">
          {messages && messages.length > 0 ? (
            messages.map((msg) => {
              const isSpam = msg.isSpam;
              const spamScore = msg.spamScore ?? 0;
              const isSuspicious = spamScore >= 0.3 && spamScore < 0.6;
              const scoreColor = isSpam ? "#e66363" : isSuspicious ? "#F4A261" : "#63e696";
              const scoreLabel = isSpam ? "SPAM" : isSuspicious ? "SUSPICIOUS" : "CLEAN";

              return (
                <div
                  key={msg.id}
                  className="flex items-center gap-4 p-4 rounded-lg transition-all"
                  style={{
                    background: isSpam ? "rgba(230, 99, 99, 0.04)" : "rgba(234, 244, 244, 0.03)",
                    border: `1px solid ${isSpam ? "rgba(230, 99, 99, 0.1)" : "rgba(234, 244, 244, 0.06)"}`,
                  }}
                >
                  {/* Sender Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${scoreColor}15` }}
                  >
                    <span className="text-xs font-bold" style={{ color: scoreColor }}>
                      {msg.senderName.charAt(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: "#EAF4F4" }}>{msg.senderName}</span>
                      <span
                        className="badge"
                        style={{ background: `${scoreColor}15`, color: scoreColor, fontSize: 9, padding: "1px 6px" }}
                      >
                        {scoreLabel}
                      </span>
                      {msg.isPruned && (
                        <span className="badge" style={{ background: "rgba(107, 114, 128, 0.15)", color: "#6b7280", fontSize: 9 }}>
                          PRUNED
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                      {msg.preview || "No preview available"}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(234, 244, 244, 0.3)" }}>
                        <Clock className="w-2.5 h-2.5" />
                        {msg.lastActiveDays !== null && msg.lastActiveDays !== undefined ? `${msg.lastActiveDays}d ago` : "Unknown"}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: "rgba(78, 128, 152, 0.2)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(msg.spamScore ?? 0) * 100}%`, background: scoreColor }}
                          />
                        </div>
                        <span className="text-[10px] mono" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                          {((msg.spamScore ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!msg.isSpam && (
                      <button
                        onClick={() => markAsSpam.mutate({ messageId: msg.id })}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: "rgba(230, 99, 99, 0.1)" }}
                        title="Mark as spam"
                      >
                        <Shield className="w-3 h-3" style={{ color: "#e66363" }} />
                      </button>
                    )}
                    <button
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "rgba(78, 168, 222, 0.1)" }}
                      title="Reply"
                    >
                      <MessageSquare className="w-3 h-3" style={{ color: "#4EA8DE" }} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Inbox className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(234, 244, 244, 0.2)" }} />
              <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                No messages in this category. Load sample data to see the spam pruner in action.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seed Confirm Modal */}
      {showSeedConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0, 0, 0, 0.6)" }}>
          <div className="glass-panel p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold mb-2" style={{ color: "#EAF4F4" }}>Load Sample Data</h3>
            <p className="text-sm mb-4" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
              This will add 8 sample DM messages with varying spam scores to demonstrate the spam pruner and inbox health features.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSeedConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => seedData.mutate()} className="btn-primary flex-1">Load Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
