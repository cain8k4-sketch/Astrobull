import { ExternalLink, Send } from "lucide-react";
import {
  TG_CONTENT_LABEL,
  TG_CONTENT_SUB,
  TG_CONTENT_UPLOAD,
} from "@/lib/community";
import { cn } from "@/lib/utils";

type Props = {
  /** compact = single row button; banner = full callout */
  variant?: "banner" | "button" | "nav";
  className?: string;
};

/**
 * Direct link into the Telegram content-creator upload chat.
 * No forms, no keys — open TG and send content.
 */
export default function TgContentDrop({ variant = "banner", className }: Props) {
  if (variant === "nav") {
    return (
      <a
        href={TG_CONTENT_UPLOAD}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm border border-blue/50 bg-blue/15 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-blue no-underline transition-colors hover:bg-blue/25",
          className,
        )}
      >
        <Send size={12} /> TG upload
      </a>
    );
  }

  if (variant === "button") {
    return (
      <a
        href={TG_CONTENT_UPLOAD}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#2AABEE] px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white no-underline shadow-[0_0_18px_rgba(42,171,238,0.35)] hover:brightness-110 sm:w-auto",
          className,
        )}
      >
        <Send size={14} />
        {TG_CONTENT_LABEL}
        <ExternalLink size={12} className="opacity-80" />
      </a>
    );
  }

  return (
    <aside
      className={cn(
        "border-2 border-[#2AABEE]/50 bg-gradient-to-b from-[#2AABEE]/15 to-black/40 px-4 py-5 sm:px-6",
        className,
      )}
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#2AABEE]">
        Fast path · creators
      </p>
      <h3 className="mt-2 font-display text-2xl uppercase leading-none text-fg sm:text-3xl">
        Upload content on Telegram
      </h3>
      <p className="mt-2 max-w-xl font-mono text-xs leading-relaxed text-muted">
        {TG_CONTENT_SUB}. No website forms, no API keys, no fiddling — open the chat,
        drop your file, done. We review there and feature winners.
      </p>
      <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted">
        <li className="text-green">· Content only (clips, images, edits)</li>
        <li>· Files stay on Telegram servers</li>
        <li>· Tag your handles in the caption for credit / pay later</li>
      </ul>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href={TG_CONTENT_UPLOAD}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#2AABEE] px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white no-underline shadow-[0_0_18px_rgba(42,171,238,0.4)] hover:brightness-110"
        >
          <Send size={14} />
          Open content chat
          <ExternalLink size={12} />
        </a>
        <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
          Direct · one tap
        </span>
      </div>
    </aside>
  );
}
