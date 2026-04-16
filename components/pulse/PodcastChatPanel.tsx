"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  text: string;
  displayName: string;
  createdAt: string;
};

function pulseApiBase(): string {
  if (typeof window === "undefined") return "";
  const path = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  return `${window.location.origin}${path}`;
}

const DISPLAY_KEY = "pulse-podcast-chat-name";

export default function PodcastChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem(DISPLAY_KEY);
      if (n) setDisplayName(n.slice(0, 24));
    } catch {
      /* ignore */
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    const base = pulseApiBase();
    if (!base) return;
    try {
      const res = await fetch(`${base}/api/pulse/podcast-chat`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: ChatMessage[] };
      if (Array.isArray(data.messages)) setMessages(data.messages);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
    const t = window.setInterval(() => void fetchMessages(), 4000);
    return () => window.clearInterval(t);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    const base = pulseApiBase();
    try {
      const name = displayName.trim().slice(0, 24) || "listener";
      try {
        localStorage.setItem(DISPLAY_KEY, name);
      } catch {
        /* ignore */
      }
      const res = await fetch(`${base}/api/pulse/podcast-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, displayName: name }),
      });
      if (!res.ok) {
        setError("Could not send message.");
        setLoading(false);
        return;
      }
      setText("");
      await fetchMessages();
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  }

  return (
    <section
      className="flex flex-col rounded border border-stone-800 bg-stone-950/90 min-h-[min(70vh,560px)] max-h-[min(85vh,720px)]"
      aria-label="Live chat"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-800 bg-stone-900/90">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">Chat</span>
        <span className="text-[10px] text-stone-600 font-mono">{messages.length} msgs</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 text-sm">
        {messages.length === 0 && (
          <p className="text-xs text-stone-500 px-1">No messages yet. Say hello below.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-xs leading-snug">
            <span className="font-mono text-stone-500 tabular-nums">
              {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}{" "}
            </span>
            <span className="font-mono text-emerald-600/90">{m.displayName}</span>
            <span className="text-stone-600"> · </span>
            <span className="text-stone-200 break-words">{m.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-stone-800 p-3 space-y-2">
        <label className="block">
          <span className="sr-only">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            maxLength={24}
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-base text-stone-200 placeholder:text-stone-600"
            autoComplete="nickname"
          />
        </label>
        <label className="block">
          <span className="sr-only">Message</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            maxLength={500}
            rows={3}
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-base text-stone-200 placeholder:text-stone-600 resize-y min-h-[88px]"
          />
        </label>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full min-h-[44px] rounded border border-stone-600 bg-stone-800 text-stone-100 text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send"}
        </button>
        <p className="text-[10px] text-stone-600 leading-relaxed">
          Chat is stored on the Pulse server (<code className="text-stone-500">data/podcast-chat.json</code>
          ). Single-instance deployments only; not synchronized across multiple replicas.
        </p>
      </form>
    </section>
  );
}
