import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Sparkles,
  Clock,
  Image,
  Link,
  Save,
  FileText,
  Check,
  Wand2,
  Calendar,
  Loader2,
} from "lucide-react";

type Tab = "writer" | "queue" | "url-to-post";

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState<Tab>("writer");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [tone, setTone] = useState("professional");
  const [format, setFormat] = useState("story");

  const utils = trpc.useUtils();
  const createPost = trpc.content.createPost.useMutation({
    onSuccess: () => {
      utils.content.listPosts.invalidate();
      utils.content.getStats.invalidate();
    },
  });
  const schedulePost = trpc.content.schedulePost.useMutation({
    onSuccess: () => {
      utils.content.getQueue.invalidate();
    },
  });
  const { data: queueItems } = trpc.content.getQueue.useQuery();
  const { data: posts } = trpc.content.listPosts.useQuery({ page: 1, limit: 20 });

  const generatePost = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation with MiniMax M2.7
    await new Promise((r) => setTimeout(r, 1500));
    const templates = [
      `I spent 6 months studying ${topic}, and here's what nobody tells you:\n\nThe conventional wisdom is completely backwards.\n\nMost people focus on surface-level metrics while ignoring the one factor that actually drives results: consistency compounded over time.\n\nAfter analyzing 100+ case studies, the pattern is crystal clear — those who show up daily, even with imperfect execution, outperform the sporadic perfectionists by 10x.\n\nThe takeaway? Start before you're ready. Iterate in public. Let your audience see the journey, not just the polished outcome.\n\nWhat's your experience with ${topic}? Share in the comments.`,

      `3 lessons about ${topic} I wish I knew 5 years ago:\n\n1. Speed beats perfection — Launch fast, learn faster\n2. Your network is your net worth — Invest in relationships early\n3. Data tells the truth — Follow the numbers, not your ego\n\nThese three principles transformed my approach to ${topic} and 10x'd my results.\n\nWhich one resonates most with you?`,

      `The biggest misconception about ${topic}?\n\nThat you need to be an expert to start.\n\nReality: The best practitioners became experts by starting as beginners and sharing their journey openly.\n\nYour fresh perspective is actually your competitive advantage.\n\nDon't wait. Start documenting your ${topic} journey today.`,
    ];
    const selected = templates[Math.floor(Math.random() * templates.length)];
    setGeneratedContent(selected);
    setIsGenerating(false);
  };

  const generateFromUrl = async () => {
    if (!urlInput.trim()) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setGeneratedContent(
      `Just read this incredible piece on ${urlInput}\n\nThe key insight that stood out to me:\n\nMost professionals in this space are focusing on tactics while completely missing the strategic shift happening right now.\n\nThe article breaks down exactly why the old playbook doesn't work anymore and what the new approach looks like.\n\nMy take: This isn't just a trend — it's a fundamental reset of how we think about this space.\n\nWhat's your perspective? Are you seeing this shift too?\n\n#LinkedIn #Growth #Strategy`
    );
    setIsGenerating(false);
  };

  const handleSavePost = async () => {
    const content = generatedContent || topic;
    if (!content.trim()) return;
    await createPost.mutateAsync({
      content,
      sourceSkill: "post-writer",
      sourceUrl: urlInput || undefined,
      status: "DRAFT",
    });
    setGeneratedContent("");
    setTopic("");
    setUrlInput("");
  };

  const handleSchedule = async () => {
    const content = generatedContent || topic;
    if (!content.trim() || !scheduleDate) return;
    const result = await createPost.mutateAsync({
      content,
      sourceSkill: "post-writer",
      status: "SCHEDULED",
    });
    if (result.id) {
      await schedulePost.mutateAsync({
        postId: result.id,
        scheduledAt: scheduleDate,
      });
    }
    setGeneratedContent("");
    setTopic("");
    setScheduleDate("");
  };

  const generateImage = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    alert("Image generation via Pollinations.ai would generate a visual based on your post content. (Simulated)");
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "writer", label: "AI Post Writer", icon: Sparkles },
    { id: "queue", label: "Post Queue", icon: Calendar },
    { id: "url-to-post", label: "URL → Post", icon: Link },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#EAF4F4" }}>Content Studio</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
            AI-powered content creation, editing, and scheduling
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "active" : ""
            }`}
            style={{
              background: activeTab === tab.id ? "rgba(78, 168, 222, 0.15)" : "rgba(234, 244, 244, 0.03)",
              color: activeTab === tab.id ? "#4EA8DE" : "rgba(234, 244, 244, 0.5)",
              border: `1px solid ${activeTab === tab.id ? "rgba(78, 168, 222, 0.3)" : "rgba(234, 244, 244, 0.06)"}`,
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Post Writer Tab */}
      {activeTab === "writer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
              Post Generator
            </h3>

            {/* Topic Input */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                Topic or Idea
              </label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="Enter a topic, idea, or prompt for your LinkedIn post..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Tone & Format */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                  Tone
                </label>
                <select
                  className="input-field"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="thought_leader">Thought Leader</option>
                  <option value="storyteller">Storyteller</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                  Format
                </label>
                <select
                  className="input-field"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="story">Story</option>
                  <option value="list">Listicle</option>
                  <option value="hook">Hook + Body</option>
                  <option value="question">Question</option>
                </select>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                Schedule (optional)
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <p className="text-[10px] mt-1" style={{ color: "rgba(234, 244, 244, 0.3)" }}>
                Optimal posting time: 9:00 AM your local timezone
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={generatePost}
                disabled={isGenerating || !topic.trim()}
                className="btn-primary flex items-center gap-2 flex-1"
                style={{ opacity: isGenerating || !topic.trim() ? 0.5 : 1 }}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
              <button
                onClick={generateImage}
                disabled={isGenerating}
                className="btn-secondary flex items-center gap-2"
                title="Generate image via Pollinations.ai"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
              Generated Post
            </h3>
            <textarea
              className="input-field min-h-[200px] resize-none"
              placeholder="Your AI-generated post will appear here..."
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
            />
            {generatedContent && (
              <div className="flex gap-3">
                <button onClick={handleSavePost} className="btn-primary flex items-center gap-2 flex-1">
                  <Save className="w-4 h-4" /> Save as Draft
                </button>
                {scheduleDate && (
                  <button onClick={handleSchedule} className="btn-primary flex items-center gap-2 flex-1">
                    <Clock className="w-4 h-4" /> Schedule Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Queue Tab */}
      {activeTab === "queue" && (
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: "#EAF4F4" }}>Post Queue</h3>
            <span className="badge badge-cyan">{queueItems?.length || 0} items</span>
          </div>
          <div className="space-y-2">
            {queueItems && queueItems.length > 0 ? (
              queueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ background: "rgba(234, 244, 244, 0.03)", border: "1px solid rgba(234, 244, 244, 0.06)" }}
                >
                  <Clock className="w-4 h-4 shrink-0" style={{ color: "#4EA8DE" }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "#EAF4F4" }}>
                      Post #{item.postId}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                      Scheduled: {new Date(item.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: item.status === "PUBLISHED" ? "rgba(99, 230, 150, 0.15)" : item.status === "FAILED" ? "rgba(230, 99, 99, 0.15)" : "rgba(78, 168, 222, 0.15)",
                      color: item.status === "PUBLISHED" ? "#63e696" : item.status === "FAILED" ? "#e66363" : "#4EA8DE",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(234, 244, 244, 0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>No scheduled posts yet.</p>
              </div>
            )}
          </div>

          {/* Draft Posts */}
          <h3 className="text-base font-semibold mt-8 mb-4" style={{ color: "#EAF4F4" }}>All Posts</h3>
          <div className="space-y-2">
            {posts && posts.length > 0 ? (
              posts.slice(0, 10).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ background: "rgba(234, 244, 244, 0.03)", border: "1px solid rgba(234, 244, 244, 0.06)" }}
                >
                  <FileText className="w-4 h-4 shrink-0" style={{ color: "#4E8098" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "#EAF4F4" }}>
                      {post.content.length > 80 ? post.content.slice(0, 80) + "..." : post.content}
                    </p>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: post.status === "PUBLISHED" ? "rgba(99, 230, 150, 0.15)" : post.status === "DRAFT" ? "rgba(78, 128, 152, 0.2)" : "rgba(78, 168, 222, 0.15)",
                      color: post.status === "PUBLISHED" ? "#63e696" : post.status === "DRAFT" ? "#4E8098" : "#4EA8DE",
                    }}
                  >
                    {post.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.5)" }}>No posts yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL to Post Tab */}
      {activeTab === "url-to-post" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
              URL → Post Pipeline
            </h3>
            <p className="text-sm" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
              Paste a link and AI will extract key points and draft a high-engagement LinkedIn post.
            </p>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(234, 244, 244, 0.6)" }}>
                Article URL
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
            <button
              onClick={generateFromUrl}
              disabled={isGenerating || !urlInput.trim()}
              className="btn-primary flex items-center gap-2 w-full"
              style={{ opacity: isGenerating || !urlInput.trim() ? 0.5 : 1 }}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              {isGenerating ? "Extracting..." : "Generate from URL"}
            </button>

            {/* Features list */}
            <div className="mt-6 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(234, 244, 244, 0.4)" }}>
                Pipeline Features
              </h4>
              {[
                "URL metadata extraction",
                "Key point summarization",
                "Hook generation",
                "Hashtag suggestion",
                "Tone matching",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <Check className="w-3 h-3" style={{ color: "#63e696" }} />
                  <span className="text-xs" style={{ color: "rgba(234, 244, 244, 0.5)" }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(234, 244, 244, 0.5)" }}>
              Generated Post
            </h3>
            <textarea
              className="input-field min-h-[200px] resize-none"
              placeholder="Extracted post content will appear here..."
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
            />
            {generatedContent && (
              <div className="flex gap-3">
                <button onClick={handleSavePost} className="btn-primary flex items-center gap-2 flex-1">
                  <Save className="w-4 h-4" /> Save as Draft
                </button>
                <button onClick={handleSchedule} className="btn-secondary flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4" /> Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
