import { cn } from "@/lib/utils";

export default function NeonSign({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm border border-green/40 px-3 py-1 font-mono text-green uppercase tracking-wide [text-shadow:0_0_10px_rgba(0,255,102,0.55)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
