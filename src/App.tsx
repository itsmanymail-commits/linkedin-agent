import { Routes, Route, Outlet } from "react-router";
import { AppShell } from "./components/AppShell";
import Home from "./pages/Home";
import ContentStudio from "./pages/ContentStudio";
import AIChat from "./pages/AIChat";
import LeadCRM from "./pages/LeadCRM";
import AnalyticsPage from "./pages/AnalyticsPage";
import DMInbox from "./pages/DMInbox";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function DashboardLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/content-studio" element={<ContentStudio />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/lead-crm" element={<LeadCRM />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/dm-inbox" element={<DMInbox />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
