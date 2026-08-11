import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import {
  loadLocalChat,
  postChat,
  subscribeChat,
  type ChatMessage,
} from "@/lib/herd-chat";
import { useReveal } from "@/hooks/use-reveal";

/** Frontend-only herd chat (local + multi-tab). Cloud later. */
export default function HerdChat() {
  const ref = useReveal<HTMLDivElement>();
  const listRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [handle, setHandle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMessages(loadLocalChat());
    return subscribeChat((msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg].slice(-80);
      });
    });
  }, []);

  // Scroll only inside the chat panel — never the whole page
  useEffect(() => {
    const box = listRef.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [messages.length]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    const res = await postChat({
      handle: handle || "anon",
      text: text.trim(),
    });
    setBusy(false);
    if (res.ok && res.msg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.msg!.id)) return prev;
        return [...prev, res.msg!].slice(-80);
      });
      setText("");
    }
  }

  return (
    <section
      id="herd-chat"
      className="border-t border-white/5 bg-surface px-4 py-16 sm:px-8 md:px-14 md:py-20"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <MessageCircle size={14} className="text-green" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-green sm:text-xs">
            Live herd
          </span>
        </div>
        <h2
          className="font-display uppercase leading-none text-fg"
          style={{ fontSize: "clamp(2.2rem, 8vw, 3.8rem)" }}
        >
          Herd
          <span className="animate-flicker"> chat</span>
        </h2>
        <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
          Drop lines with the herd. Messages stay on this device (and sync across
          open tabs). Cloud multi-user comes later.
        </p>

        <div className="mt-6 overflow-hidden rounded-md border border-white/10 bg-bg">
          <div
            ref={listRef}
            className="max-h-[340px] space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-sm border border-white/5 bg-surface/80 px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-red">
                    {m.handle}
                  </span>
                  <span className="font-mono text-[9px] text-dim">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs leading-relaxed text-fg/90">
                  {m.text}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={onSend}
            className="flex flex-col gap-2 border-t border-white/10 p-3 sm:flex-row sm:items-center"
          >
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@handle"
              className="w-full rounded-sm border border-white/15 bg-bg px-3 py-2.5 font-mono text-xs text-fg outline-none placeholder:text-dim focus:border-green sm:w-36"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message the herd…"
              maxLength={400}
              className="min-w-0 flex-1 rounded-sm border border-white/15 bg-bg px-3 py-2.5 font-mono text-xs text-fg outline-none placeholder:text-dim focus:border-green"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-green px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg disabled:opacity-40"
            >
              <Send size={12} />
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
