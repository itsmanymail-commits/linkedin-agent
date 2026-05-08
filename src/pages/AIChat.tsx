import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Trash2,
  Hash,
  TrendingUp,
  UserCheck,
  BarChart3,
  MessageSquare,
  Zap,
} from "lucide-react";

const intentConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  post_writer: { label: "Post Writer", icon: Sparkles, color: "#4EA8DE", bg: "rgba(78, 168, 222, 0.1)" },
  dm_composer: { label: "DM Composer", icon: MessageSquare, color: "#a78bfa", bg: "rgba(167, 139, 250, 0.1)" },
  profile_auditor: { label: "Profile Auditor", icon: UserCheck, color: "#63e696", bg: "rgba(99, 230, 150, 0.1)" },
  trend_analyst: { label: "Trend Analyst", icon: TrendingUp, color: "#F4A261", bg: "rgba(244, 162, 97, 0.1)" },
  lead_scorer: { label: "Lead Scorer", icon: Zap, color: "#e66363", bg: "rgba(230, 99, 99, 0.1)" },
  analytics_reader: { label: "Analytics", icon: BarChart3, color: "#34d399", bg: "rgba(52, 211, 153, 0.1)" },
  conversational: { label: "Assistant", icon: Bot, color: "#4E8098", bg: "rgba(78, 128, 152, 0.1)" },
};

const suggestedPrompts = [
  { text: "#Post Write a post about AI in business", intent: "post_writer" },
  { text: "Audit my LinkedIn profile", intent: "profile_auditor" },
  { text: "What are the trending topics in SaaS?", intent: "trend_analyst" },
  { text: "Score my lead pipeline", intent: "lead_scorer" },
  { text: "Draft a DM for a tech lead prospect", intent: "dm_composer" },
  { text: "Show my analytics summary", intent: "analytics_reader" },
];

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{ id: number; role: string; content: string; intent?: string; createdAt: Date }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: history } = trpc.chat.getHistory.useQuery();
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: data.response,
          intent: data.intent,
          createdAt: new Date(),
        },
      ]);
      setIsTyping(false);
      utils.chat.getHistory.invalidate();
    },
  });
  const clearHistory = trpc.chat.clearHistory.useMutation({
    onSuccess: () => {
      setLocalMessages([]);
      utils.chat.getHistory.invalidate();
    },
  });

  const messages = history && history.length > 0
    ? [...history.map(h => ({ ...h, createdAt: new Date(h.createdAt) })), ...localMessages]
    : localMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage("");
    setLocalMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: userMsg, createdAt: new Date() },
    ]);
    setIsTyping(true);
    await sendMessage.mutateAsync({ content: userMsg });
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#EAF4F4" }}>AI Chat Assistant</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            Intent detection, dynamic persona, and smart routing powered by MiniMax M2.7
          </p>
        </div>
        <button
          onClick={() => clearHistory.mutate()}
          className="btn-secondary flex items-center gap-2 text-xs"
        >
          <Trash2 className="w-3 h-3" /> Clear History
        </button>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 glass-panel p-6 overflow-y-auto space-y-4 min-h-0"
      >
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(78, 168, 222, 0.15)", border: "1px solid rgba(78, 168, 222, 0.2)" }}
            >
              <Bot className="w-8 h-8" style={{ color: "#4EA8DE" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#EAF4F4" }}>
              LinkAgent AI Assistant
            </h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
              I can help you write posts, compose DMs, audit your profile, analyze trends, score leads, and review analytics.
              Use #Post, #DM, or #Audit tags to route directly.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const intent = msg.intent ? intentConfig[msg.intent] : null;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: isUser ? "rgba(78, 168, 222, 0.15)" : "rgba(99, 230, 150, 0.1)",
                  border: `1px solid ${isUser ? "rgba(78, 168, 222, 0.2)" : "rgba(99, 230, 150, 0.15)"}`,
                }}
              >
                {isUser ? (
                  <User className="w-4 h-4" style={{ color: "#4EA8DE" }} />
                ) : (
                  <Bot className="w-4 h-4" style={{ color: "#63e696" }} />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[70%] ${isUser ? "text-right" : ""}`}>
                {/* Intent Badge */}
                {!isUser && intent && (
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md mb-1.5"
                    style={{ background: intent.bg }}
                  >
                    <intent.icon className="w-3 h-3" style={{ color: intent.color }} />
                    <span className="text-[11px] font-medium" style={{ color: intent.color }}>
                      {intent.label}
                    </span>
                  </div>
                )}
                <div
                  className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: isUser
                      ? "rgba(78, 168, 222, 0.12)"
                      : "rgba(234, 244, 244, 0.04)",
                    border: `1px solid ${isUser ? "rgba(78, 168, 222, 0.15)" : "rgba(234, 244, 244, 0.06)"}`,
                    color: "#EAF4F4",
                    textAlign: "left",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(99, 230, 150, 0.1)", border: "1px solid rgba(99, 230, 150, 0.15)" }}
            >
              <Bot className="w-4 h-4" style={{ color: "#63e696" }} />
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ background: "rgba(234, 244, 244, 0.04)", border: "1px solid rgba(234, 244, 244, 0.06)" }}
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#4EA8DE", animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#4EA8DE", animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#4EA8DE", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="mt-4 shrink-0">
          <p className="text-xs font-medium mb-2" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
            Try these prompts:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => {
              const intent = intentConfig[prompt.intent];
              return (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{ background: intent?.bg, color: intent?.color, border: `1px solid ${intent?.color}30` }}
                >
                  <Hash className="w-3 h-3" />
                  {prompt.text.length > 40 ? prompt.text.slice(0, 40) + "..." : prompt.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="mt-4 shrink-0">
        <div className="glass-panel p-3 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: "#EAF4F4" }}
            placeholder="Type your message... Use #Post, #DM, #Audit for quick routing"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isTyping}
            className="btn-primary flex items-center gap-2"
            style={{ opacity: !message.trim() || isTyping ? 0.5 : 1, padding: "8px 16px" }}
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] mt-2 text-center" style={{ color: "rgba(234, 244, 244, 0.3)" }}>
          Powered by MiniMax M2.7 · Intent detection · Dynamic Persona Engine
        </p>
      </div>
    </div>
  );
}
