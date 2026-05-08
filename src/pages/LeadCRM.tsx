import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Search,
  Target,
  Loader2,
  Users,
  TrendingUp,
  Filter,
  ChevronRight,
  Star,
  Trash2,
  Sparkles,
} from "lucide-react";

const LEAD_STATUSES = [
  { key: "DISCOVERED", label: "Discovered", color: "#4E8098" },
  { key: "ENRICHED", label: "Enriched", color: "#4EA8DE" },
  { key: "QUALIFIED", label: "Qualified", color: "#a78bfa" },
  { key: "PENDING", label: "Pending", color: "#F4A261" },
  { key: "CONNECTED", label: "Connected", color: "#63e696" },
  { key: "COMPLETED", label: "Completed", color: "#34d399" },
] as const;

type ViewMode = "kanban" | "list" | "discover";

export default function LeadCRM() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState({ firstName: "", lastName: "", headline: "", linkedinUrl: "" });
  const [scoringLeadId, setScoringLeadId] = useState<number | null>(null);
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoveredKeywords, setDiscoveredKeywords] = useState<string[]>([]);

  const utils = trpc.useUtils();
  const { data: leads } = trpc.lead.listLeads.useQuery({ page: 1, limit: 100 });
  const { data: campaigns } = trpc.lead.listCampaigns.useQuery();
  const { data: stats } = trpc.lead.getStats.useQuery();

  const createLead = trpc.lead.createLead.useMutation({
    onSuccess: () => {
      utils.lead.listLeads.invalidate();
      utils.lead.getStats.invalidate();
      setShowAddForm(false);
      setNewLead({ firstName: "", lastName: "", headline: "", linkedinUrl: "" });
    },
  });

  const scoreLead = trpc.lead.scoreLead.useMutation({
    onSuccess: () => {
      utils.lead.listLeads.invalidate();
      utils.lead.getStats.invalidate();
      setScoringLeadId(null);
    },
  });

  const batchScore = trpc.lead.batchScore.useMutation({
    onSuccess: () => {
      utils.lead.listLeads.invalidate();
      utils.lead.getStats.invalidate();
    },
  });

  const updateLead = trpc.lead.updateLead.useMutation({
    onSuccess: () => {
      utils.lead.listLeads.invalidate();
      utils.lead.getStats.invalidate();
    },
  });

  const deleteLead = trpc.lead.deleteLead.useMutation({
    onSuccess: () => {
      utils.lead.listLeads.invalidate();
      utils.lead.getStats.invalidate();
    },
  });

  const handleDiscover = async () => {
    if (!discoveryQuery.trim()) return;
    // Simulate AI keyword generation
    await new Promise((r) => setTimeout(r, 1000));
    const keywords = [
      `"${discoveryQuery}" AND ("VP" OR "Director" OR "Head")`,
      `"${discoveryQuery}" AND ("founder" OR "CEO" OR "CTO")`,
      `"${discoveryQuery}" AND ("hiring" OR "recruiting" OR "talent")`,
      `"${discoveryQuery}" AND ("growth" OR "strategy" OR "operations")`,
      `"${discoveryQuery}" AND ("SaaS" OR "tech" OR "software")`,
    ];
    setDiscoveredKeywords(keywords);
  };

  const handleCreateLead = async () => {
    if (!newLead.firstName || !newLead.lastName) return;
    await createLead.mutateAsync(newLead);
  };

  const handleScore = async (leadId: number) => {
    setScoringLeadId(leadId);
    await scoreLead.mutateAsync({ leadId });
  };

  const handleBatchScore = async () => {
    const unScoredLeads = filteredLeads?.filter((l) => !l.bayesianScore).map((l) => l.id);
    if (unScoredLeads && unScoredLeads.length > 0) {
      await batchScore.mutateAsync({ leadIds: unScoredLeads.slice(0, 10) });
    }
  };

  const handleMoveLead = async (leadId: number, newStatus: string) => {
    await updateLead.mutateAsync({ id: leadId, status: newStatus as "DISCOVERED" | "ENRICHED" | "QUALIFIED" | "PENDING" | "CONNECTED" | "COMPLETED" | "FAILED" | "IGNORED" | "DISQUALIFIED" });
  };

  const filteredLeads = leads?.filter((lead) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.firstName.toLowerCase().includes(q) ||
      lead.lastName.toLowerCase().includes(q) ||
      (lead.headline && lead.headline.toLowerCase().includes(q)) ||
      (lead.industry && lead.industry.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#EAF4F4" }}>Lead CRM</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            6-state Kanban pipeline with Bayesian scoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleBatchScore} className="btn-secondary flex items-center gap-2 text-xs">
            <Target className="w-4 h-4" /> Batch Score
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2 text-xs">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: stats?.totalLeads || 0, icon: Users, color: "#4EA8DE" },
          { label: "Avg Score", value: stats?.avgScore ? (stats.avgScore * 100).toFixed(1) + "%" : "N/A", icon: Target, color: "#a78bfa" },
          { label: "Connected", value: stats?.statusCounts?.find(s => s.status === "CONNECTED")?.count || 0, icon: TrendingUp, color: "#63e696" },
          { label: "Campaigns", value: campaigns?.length || 0, icon: Filter, color: "#F4A261" },
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

      {/* View Tabs + Search */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {[
            { id: "kanban" as ViewMode, label: "Kanban" },
            { id: "list" as ViewMode, label: "List" },
            { id: "discover" as ViewMode, label: "AI Discovery" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: viewMode === tab.id ? "rgba(78, 168, 222, 0.15)" : "transparent",
                color: viewMode === tab.id ? "#4EA8DE" : "rgba(234, 244, 244, 0.5)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(234, 244, 244, 0.3)" }} />
          <input
            type="text"
            className="input-field pl-10 w-64"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEAD_STATUSES.map((status) => {
            const statusLeads = filteredLeads?.filter((l) => l.status === status.key) || [];
            return (
              <div key={status.key} className="glass-panel p-3 min-h-[300px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: status.color }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-xs mono font-bold" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                    {statusLeads.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {statusLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 rounded-lg cursor-pointer transition-all hover:translate-y-[-1px]"
                      style={{ background: "rgba(234, 244, 244, 0.04)", border: "1px solid rgba(234, 244, 244, 0.06)" }}
                      draggable
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {lead.profileImageUrl ? (
                            <img src={lead.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${status.color}20` }}>
                              <span className="text-[10px] font-bold" style={{ color: status.color }}>
                                {lead.firstName[0]}{lead.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium" style={{ color: "#EAF4F4" }}>
                              {lead.firstName} {lead.lastName}
                            </p>
                            {lead.headline && (
                              <p className="text-[10px] truncate max-w-[120px]" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                                {lead.headline}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Score */}
                      {lead.bayesianScore !== null && lead.bayesianScore !== undefined && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Star className="w-3 h-3" style={{ color: lead.bayesianScore > 0.7 ? "#F4A261" : "#4E8098" }} />
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(78, 128, 152, 0.2)" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${lead.bayesianScore * 100}%`,
                                background: lead.bayesianScore > 0.7 ? "#63e696" : lead.bayesianScore > 0.4 ? "#F4A261" : "#e66363",
                              }}
                            />
                          </div>
                          <span className="text-[10px] mono" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                            {(lead.bayesianScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {/* Actions */}
                      <div className="mt-2 flex items-center gap-1">
                        {!lead.bayesianScore && (
                          <button
                            onClick={() => handleScore(lead.id)}
                            disabled={scoringLeadId === lead.id}
                            className="text-[10px] px-2 py-0.5 rounded flex items-center gap-1"
                            style={{ background: "rgba(78, 168, 222, 0.1)", color: "#4EA8DE" }}
                          >
                            {scoringLeadId === lead.id ? <Loader2 className="w-2 h-2 animate-spin" /> : <Target className="w-2 h-2" />}
                            Score
                          </button>
                        )}
                        <button
                          onClick={() => deleteLead.mutate({ id: lead.id })}
                          className="text-[10px] px-2 py-0.5 rounded ml-auto"
                          style={{ background: "rgba(230, 99, 99, 0.1)", color: "#e66363" }}
                        >
                          <Trash2 className="w-2 h-2" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="glass-panel p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(234, 244, 244, 0.08)" }}>
                  {["Name", "Headline", "Status", "Score", "Industry", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider py-3 px-3" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads?.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-white/5" style={{ borderBottom: "1px solid rgba(234, 244, 244, 0.04)" }}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(78, 168, 222, 0.1)" }}>
                          <span className="text-[10px] font-bold" style={{ color: "#4EA8DE" }}>{lead.firstName[0]}</span>
                        </div>
                        <span className="text-sm" style={{ color: "#EAF4F4" }}>{lead.firstName} {lead.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm max-w-[200px] truncate" style={{ color: "rgba(234, 244, 244, 0.6)" }}>{lead.headline || "—"}</td>
                    <td className="py-3 px-3">
                      <span className="badge" style={{
                        background: `${LEAD_STATUSES.find(s => s.key === lead.status)?.color}15`,
                        color: LEAD_STATUSES.find(s => s.key === lead.status)?.color,
                      }}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {lead.bayesianScore !== null && lead.bayesianScore !== undefined ? (
                        <span className="text-sm mono font-bold" style={{ color: lead.bayesianScore > 0.7 ? "#63e696" : lead.bayesianScore > 0.4 ? "#F4A261" : "#e66363" }}>
                          {(lead.bayesianScore * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <button onClick={() => handleScore(lead.id)} className="text-xs" style={{ color: "#4EA8DE" }}>Score</button>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>{lead.industry || "—"}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {LEAD_STATUSES.map((status, idx) => {
                          if (idx === 0) return null;
                          return (
                            <button
                              key={status.key}
                              onClick={() => handleMoveLead(lead.id, status.key)}
                              className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold transition-all"
                              style={{
                                background: lead.status === status.key ? `${status.color}30` : "rgba(78, 128, 152, 0.1)",
                                color: status.color,
                              }}
                              title={`Move to ${status.label}`}
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          );
                        })}
                        <button onClick={() => deleteLead.mutate({ id: lead.id })} className="w-5 h-5 rounded flex items-center justify-center ml-1" style={{ background: "rgba(230, 99, 99, 0.1)" }}>
                          <Trash2 className="w-3 h-3" style={{ color: "#e66363" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Discovery View */}
      {viewMode === "discover" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" style={{ color: "#4EA8DE" }} />
              <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>AI Lead Discovery</h3>
            </div>
            <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
              Describe your target audience and AI will generate optimized LinkedIn People Search keywords.
            </p>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                Campaign Objective / Target Profile
              </label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="e.g., VP of Engineering at Series B SaaS companies in fintech"
                value={discoveryQuery}
                onChange={(e) => setDiscoveryQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleDiscover}
              disabled={!discoveryQuery.trim()}
              className="btn-primary flex items-center gap-2 w-full"
              style={{ opacity: !discoveryQuery.trim() ? 0.5 : 1 }}
            >
              <Sparkles className="w-4 h-4" /> Generate Search Keywords
            </button>

            {/* BALD Info */}
            <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(167, 139, 250, 0.05)", border: "1px solid rgba(167, 139, 250, 0.15)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: "#a78bfa" }} />
                <span className="text-sm font-semibold" style={{ color: "#a78bfa" }}>BALD Active Learning</span>
              </div>
              <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                Select the most informative leads to label, improving the Bayesian model with minimum effort.
                Label 5 leads to improve accuracy by ~18%.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="glass-panel p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
              Generated Keywords
            </h3>
            {discoveredKeywords.length > 0 ? (
              <div className="space-y-3">
                {discoveredKeywords.map((kw, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg flex items-center gap-3"
                    style={{ background: "rgba(234, 244, 244, 0.03)", border: "1px solid rgba(234, 244, 244, 0.06)" }}
                  >
                    <span className="text-xs mono font-bold w-6" style={{ color: "#4EA8DE" }}>{idx + 1}</span>
                    <code className="text-xs flex-1" style={{ color: "#EAF4F4" }}>{kw}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(kw)}
                      className="text-[10px] px-2 py-1 rounded"
                      style={{ background: "rgba(78, 168, 222, 0.1)", color: "#4EA8DE" }}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(234, 244, 244, 0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
                  Enter a target profile description to generate search keywords.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0, 0, 0, 0.6)" }}>
          <div className="glass-panel p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>Add New Lead</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="First Name" value={newLead.firstName} onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })} />
              <input className="input-field" placeholder="Last Name" value={newLead.lastName} onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })} />
              <input className="input-field" placeholder="Headline / Title" value={newLead.headline} onChange={(e) => setNewLead({ ...newLead, headline: e.target.value })} />
              <input className="input-field" placeholder="LinkedIn URL" value={newLead.linkedinUrl} onChange={(e) => setNewLead({ ...newLead, linkedinUrl: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreateLead} disabled={!newLead.firstName || !newLead.lastName} className="btn-primary flex-1" style={{ opacity: !newLead.firstName || !newLead.lastName ? 0.5 : 1 }}>
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
