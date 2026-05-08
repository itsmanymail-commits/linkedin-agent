import { Sparkles, Shield, Zap, Database } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#2C363F" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #4EA8DE, #3d8bc4)" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#EAF4F4", fontFamily: "Inter, sans-serif" }}
          >
            LinkAgent AI
          </h1>
          <p className="text-sm mt-2" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            20 AI skills & features across 6 modules
          </p>
        </div>

        {/* Login Card */}
        <div
          className="p-8 rounded-2xl space-y-6"
          style={{
            background: "rgba(44, 54, 63, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(234, 244, 244, 0.1)",
          }}
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold" style={{ color: "#EAF4F4" }}>
              Welcome back
            </h2>
            <p className="text-sm mt-1" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
              Sign in to access your AI-powered LinkedIn growth dashboard
            </p>
          </div>

          <button
            onClick={() => { window.location.href = getOAuthUrl(); }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
          >
            <Sparkles className="w-5 h-5" />
            Sign in with Kimi
          </button>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 pt-4" style={{ borderTop: "1px solid rgba(234, 244, 244, 0.08)" }}>
            {[
              { icon: Zap, label: "MiniMax M2.7", color: "#4EA8DE" },
              { icon: Shield, label: "LinkedIn OAuth v2", color: "#63e696" },
              { icon: Database, label: "Neon Postgres", color: "#a78bfa" },
              { icon: Sparkles, label: "20 AI Features", color: "#F4A261" },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-2">
                <feat.icon className="w-3.5 h-3.5" style={{ color: feat.color }} />
                <span className="text-[11px]" style={{ color: "rgba(234, 244, 244, 0.5)" }}>{feat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: "rgba(234, 244, 244, 0.3)" }}>
          Next.js 14 · MiniMax M2.7 · Vercel · Serverless
        </p>
      </div>
    </div>
  );
}
