import { cn } from "@/lib/utils";

export type InlineStatusKind = "idle" | "pending" | "ok" | "err" | "info";

export type InlineStatus = {
  kind: InlineStatusKind;
  text: string | null;
};

export const idleStatus: InlineStatus = { kind: "idle", text: null };

export function InlineStatusText({
  status,
  className,
}: {
  status: InlineStatus | null | undefined;
  className?: string;
}) {
  if (!status || status.kind === "idle" || !status.text) return null;
  return (
    <p
      role="status"
      className={cn(
        "font-mono text-[11px] leading-relaxed",
        status.kind === "ok" && "text-green",
        status.kind === "err" && "text-red-hot",
        status.kind === "pending" && "text-gold",
        status.kind === "info" && "text-muted",
        className,
      )}
    >
      {status.text}
    </p>
  );
}
