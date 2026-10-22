import { CloudOff, Inbox, Loader2, RefreshCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 6;

interface DataStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: ReactNode;
  errorTitle?: string;
  errorIcon?: LucideIcon;
  errorAction?: ReactNode;
  refusalTitle?: string;
  onRetry?: () => void;
  children: ReactNode;
}

function LoadingRows({ label }: { label: string }) {
  return (
    <div role="status" className="space-y-3 p-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> {label}
      </p>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-1" aria-hidden>
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

interface StateBoxProps {
  icon: LucideIcon;
  title?: string;
  message: string;
  role: "status" | "alert";
  action?: ReactNode;
}

function StateBox({ icon: Icon, title, message, role, action }: StateBoxProps) {
  return (
    <div role={role} className="flex flex-col items-center gap-3 px-4 py-12 text-center text-sm text-muted-foreground">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-5" />
      </span>
      <div className="max-w-sm space-y-1">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        <p>{message}</p>
      </div>
      {action}
    </div>
  );
}

export function DataState({
  loading,
  error,
  empty,
  loadingLabel = "Carregando...",
  emptyTitle,
  emptyMessage = "Nenhum registro encontrado.",
  emptyIcon = Inbox,
  emptyAction,
  errorTitle,
  errorIcon = CloudOff,
  errorAction,
  refusalTitle,
  onRetry,
  children,
}: DataStateProps) {
  if (loading) return <LoadingRows label={loadingLabel} />;
  if (error && refusalTitle) {
    return (
      <div className="p-4">
        <Notice tone="error" title={refusalTitle}>
          {error}
        </Notice>
      </div>
    );
  }
  if (error) {
    const retry = onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw /> Tentar de novo
      </Button>
    );
    return <StateBox role="alert" icon={errorIcon} title={errorTitle} message={error} action={errorAction ?? retry} />;
  }
  if (empty) {
    return <StateBox role="status" icon={emptyIcon} title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }
  return <>{children}</>;
}
