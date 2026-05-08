import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  User,
  Bell,
  Shield,
  Clock,
  Palette,
  Sparkles,
  Save,
  Globe,
  MessageSquare,
  TrendingUp,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const updateProfile = trpc.settings.updateProfile.useMutation({
    onSuccess: () => utils.settings.getProfile.invalidate(),
  });
  const updatePersona = trpc.settings.updatePersona.useMutation({
    onSuccess: () => utils.settings.getProfile.invalidate(),
  });

  const [persona, setPersona] = useState({
    voice: profile?.personaVoice || "professional",
    tone: profile?.personaTone || "confident",
    vocabulary: profile?.personaVocabulary || "advanced",
  });

  const [notifications, setNotifications] = useState({
    notifyOnPublish: profile?.notifyOnPublish ?? true,
    notifyOnFailure: profile?.notifyOnFailure ?? true,
    weeklyDigest: profile?.weeklyDigest ?? true,
  });

  const [timezone, setTimezone] = useState(profile?.timezone || "UTC");
  const [optimalHour, setOptimalHour] = useState(profile?.optimalPostHour || 9);

  const handleSavePersona = async () => {
    await updatePersona.mutateAsync({
      personaVoice: persona.voice as "professional" | "casual" | "thought_leader" | "storyteller",
      personaTone: persona.tone as "confident" | "humble" | "energetic" | "calm",
      personaVocabulary: persona.vocabulary as "simple" | "advanced" | "technical" | "conversational",
    });
  };

  const handleSaveNotifications = async () => {
    await updateProfile.mutateAsync({
      notifyOnPublish: notifications.notifyOnPublish,
      notifyOnFailure: notifications.notifyOnFailure,
      weeklyDigest: notifications.weeklyDigest,
      timezone,
      optimalPostHour: optimalHour,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "#EAF4F4" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
          Configure your persona, notifications, and integrations
        </p>
      </div>

      {/* Profile Info */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(78, 168, 222, 0.1)", border: "1px solid rgba(78, 168, 222, 0.15)" }}
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <User className="w-7 h-7" style={{ color: "#4EA8DE" }} />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>{profile?.name || "User"}</h3>
            <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>{profile?.email || "No email"}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-cyan text-[10px]">{profile?.role || "user"}</span>
              <span className="badge badge-slate text-[10px]">OAuth v2</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Persona Engine */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: "#4EA8DE" }} />
            <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>Dynamic Persona Engine</h3>
          </div>
          <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            Configure your brand voice. The AI writes every post in your unique style.
          </p>

          {/* Voice */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
              Writing Voice
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["professional", "casual", "thought_leader", "storyteller"].map((v) => (
                <button
                  key={v}
                  onClick={() => setPersona({ ...persona, voice: v })}
                  className="p-3 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: persona.voice === v ? "rgba(78, 168, 222, 0.15)" : "rgba(234, 244, 244, 0.03)",
                    color: persona.voice === v ? "#4EA8DE" : "rgba(234, 244, 244, 0.5)",
                    border: `1px solid ${persona.voice === v ? "rgba(78, 168, 222, 0.3)" : "rgba(234, 244, 244, 0.06)"}`,
                  }}
                >
                  {v.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
              Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["confident", "humble", "energetic", "calm"].map((t) => (
                <button
                  key={t}
                  onClick={() => setPersona({ ...persona, tone: t })}
                  className="p-3 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: persona.tone === t ? "rgba(167, 139, 250, 0.15)" : "rgba(234, 244, 244, 0.03)",
                    color: persona.tone === t ? "#a78bfa" : "rgba(234, 244, 244, 0.5)",
                    border: `1px solid ${persona.tone === t ? "rgba(167, 139, 250, 0.3)" : "rgba(234, 244, 244, 0.06)"}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Vocabulary */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
              Vocabulary Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["simple", "advanced", "technical", "conversational"].map((v) => (
                <button
                  key={v}
                  onClick={() => setPersona({ ...persona, vocabulary: v })}
                  className="p-3 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: persona.vocabulary === v ? "rgba(99, 230, 150, 0.15)" : "rgba(234, 244, 244, 0.03)",
                    color: persona.vocabulary === v ? "#63e696" : "rgba(234, 244, 244, 0.5)",
                    border: `1px solid ${persona.vocabulary === v ? "rgba(99, 230, 150, 0.3)" : "rgba(234, 244, 244, 0.06)"}`,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSavePersona} className="btn-primary flex items-center gap-2 w-full">
            <Save className="w-4 h-4" /> Save Persona
          </button>
        </div>

        {/* Notifications & Schedule */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: "#F4A261" }} />
              <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>Notifications</h3>
            </div>

            {[
              { key: "notifyOnPublish" as const, label: "Publish Success", desc: "Get notified when a post is published", icon: Check },
              { key: "notifyOnFailure" as const, label: "Publish Failure", desc: "Get notified when a post fails to publish", icon: Bell },
              { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Receive a weekly summary every Monday", icon: TrendingUp },
            ].map((notif) => (
              <div key={notif.key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(234, 244, 244, 0.03)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(244, 162, 97, 0.1)" }}>
                    <notif.icon className="w-4 h-4" style={{ color: "#F4A261" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#EAF4F4" }}>{notif.label}</p>
                    <p className="text-[10px]" style={{ color: "rgba(234, 244, 244, 0.4)" }}>{notif.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [notif.key]: !notifications[notif.key] })}
                  className="w-10 h-6 rounded-full transition-all relative"
                  style={{
                    background: notifications[notif.key] ? "#4EA8DE" : "rgba(78, 128, 152, 0.3)",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full absolute top-1 transition-all"
                    style={{
                      background: "white",
                      left: notifications[notif.key] ? "22px" : "4px",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Schedule Settings */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: "#63e696" }} />
              <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>Schedule Settings</h3>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                Timezone
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(234, 244, 244, 0.3)" }} />
                <select
                  className="input-field pl-10"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                Optimal Post Hour: {optimalHour}:00
              </label>
              <input
                type="range"
                min={6}
                max={20}
                value={optimalHour}
                onChange={(e) => setOptimalHour(Number(e.target.value))}
                className="w-full accent-[#4EA8DE]"
                style={{ accentColor: "#4EA8DE" }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: "rgba(234, 244, 244, 0.3)" }}>
                <span>6:00</span>
                <span>13:00</span>
                <span>20:00</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Status */}
          <div className="glass-panel p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: "#4E8098" }} />
              <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>Infrastructure</h3>
            </div>
            {[
              { name: "LinkedIn OAuth v2", status: "Connected", icon: Shield, color: "#63e696" },
              { name: "Neon Postgres + Prisma", status: "Online", icon: MessageSquare, color: "#63e696" },
              { name: "Vercel Cron Jobs", status: "Active (2/2)", icon: Clock, color: "#4EA8DE" },
              { name: "AES-256 Token Encryption", status: "Enabled", icon: Palette, color: "#63e696" },
            ].map((infra) => (
              <div key={infra.name} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(234, 244, 244, 0.03)" }}>
                <div className="flex items-center gap-2">
                  <infra.icon className="w-3.5 h-3.5" style={{ color: "#4E8098" }} />
                  <span className="text-xs" style={{ color: "#EAF4F4" }}>{infra.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: infra.color }} />
                  <span className="text-[10px] font-medium" style={{ color: infra.color }}>{infra.status}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSaveNotifications} className="btn-primary flex items-center gap-2 w-full">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
