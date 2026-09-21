"use client";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 40,
  withWordmark = true,
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/logo.png"
        alt="Samsmarana logo"
        width={size}
        height={size}
        className="rounded-xl object-contain"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <div className="leading-none">
          <div className="font-serif text-lg font-semibold tracking-tight text-foreground">
            Samsmarana
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Memory &amp; Cognitive Engagement
          </div>
        </div>
      )}
    </div>
  );
}
