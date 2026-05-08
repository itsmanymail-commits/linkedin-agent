import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  PenTool,
  Bot,
  Users,
  BarChart3,
  Mail,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/content-studio", label: "Content Studio", icon: PenTool },
  { path: "/ai-chat", label: "AI Chat", icon: Bot },
  { path: "/lead-crm", label: "Lead CRM", icon: Users },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/dm-inbox", label: "DM & Inbox", icon: Mail },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#2C363F" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full transition-all duration-300 shrink-0"
        style={{
          width: collapsed ? 64 : 240,
          background: "#2C363F",
          borderRight: "1px solid rgba(78, 128, 152, 0.2)",
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ background: "linear-gradient(135deg, #4EA8DE, #3d8bc4)" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: "#EAF4F4", fontFamily: "Inter, sans-serif" }}
            >
              LinkAgent
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-link w-full ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
                style={{
                  justifyContent: collapsed ? "center" : undefined,
                  padding: collapsed ? "10px" : undefined,
                }}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 space-y-1 shrink-0" style={{ borderTop: "1px solid rgba(78, 128, 152, 0.15)" }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link w-full"
            style={{ justifyContent: collapsed ? "center" : undefined }}
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="sidebar-link w-full"
            style={{ justifyContent: collapsed ? "center" : undefined }}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between h-16 px-6 shrink-0"
          style={{
            background: "rgba(44, 54, 63, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(78, 128, 152, 0.15)",
            zIndex: 40,
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "rgba(234, 244, 244, 0.4)" }}>Dashboard</span>
            <span style={{ color: "rgba(234, 244, 244, 0.3)" }}>/</span>
            <span style={{ color: "#EAF4F4" }}>
              {navItems.find((n) => n.path === location.pathname)?.label || "Page"}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{ background: "rgba(78, 168, 222, 0.1)" }}
            >
              <Bell className="w-4 h-4" style={{ color: "#4EA8DE" }} />
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid rgba(78, 128, 152, 0.2)" }}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: "rgba(78, 168, 222, 0.2)" }}
                  >
                    <span className="text-xs font-medium" style={{ color: "#4EA8DE" }}>
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium" style={{ color: "#EAF4F4" }}>
                  {user.name || "User"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#2C363F" }}>
          <div className="p-6 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
