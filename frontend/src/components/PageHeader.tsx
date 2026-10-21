import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  icon?: LucideIcon;
  media?: ReactNode;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, media, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        {media ??
          (Icon && (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 text-primary">
              <Icon className="size-5" />
            </div>
          ))}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}
