import { AlertCircle, Inbox, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";

interface DataStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  errorTitle?: string;
  onRetry?: () => void;
  children: ReactNode;
}

function StateBox({ icon, title, message, role, children }: {
  icon: ReactNode;
  title?: string;
  message: string;
  role: "status" | "alert";
  children?: ReactNode;
}) {
  return (
    <div role={role} className="flex flex-col items-center gap-3 px-4 py-12 text-center text-sm text-muted-foreground">
      {icon}
      <div className="max-w-sm space-y-1">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        <p>{message}</p>
      </div>
      {children}
    </div>
  );
}

export function DataState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyMessage = "Nenhum registro encontrado.",
  emptyIcon: EmptyIcon = Inbox,
  errorTitle,
  onRetry,
  children,
}: DataStateProps) {
  if (loading) {
    return <StateBox role="status" icon={<Loader2 className="size-5 animate-spin" />} message="Carregando..." />;
  }
  if (error && errorTitle) {
    return (
      <div className="p-4">
        <Notice tone="error" title={errorTitle}>
          {error}
        </Notice>
      </div>
    );
  }
  if (error) {
    return (
      <StateBox role="alert" icon={<AlertCircle className="size-5 text-destructive" />} message={error}>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </StateBox>
    );
  }
  if (empty) {
    return (
      <StateBox
        role="status"
        icon={
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <EmptyIcon className="size-5" />
          </span>
        }
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }
  return <>{children}</>;
}
