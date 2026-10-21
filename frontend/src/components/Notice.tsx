import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "error";

const TONE_STYLE: Record<Tone, string> = {
  info: "border-border bg-muted/50 text-muted-foreground",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-700",
};

const TONE_ICON: Record<Tone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

interface NoticeProps {
  tone: Tone;
  title?: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
}

export function Notice({ tone, title, icon, className, children }: NoticeProps) {
  const Icon = icon ?? TONE_ICON[tone];
  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-3 text-sm", TONE_STYLE[tone], className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
