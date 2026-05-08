import { useNavigate } from "react-router";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#2C363F" }}
    >
      <div className="text-center space-y-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(244, 162, 97, 0.1)", border: "1px solid rgba(244, 162, 97, 0.2)" }}
        >
          <AlertTriangle className="w-10 h-10" style={{ color: "#F4A261" }} />
        </div>
        <div>
          <h1 className="text-4xl font-bold mono" style={{ color: "#EAF4F4" }}>404</h1>
          <p className="text-sm mt-2" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            This page doesn't exist in the LinkAgent AI dashboard.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <Home className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
