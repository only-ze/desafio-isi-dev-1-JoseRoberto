import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface DataStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

function StateBox({ icon, message, role, children }: {
  icon: ReactNode;
  message: string;
  role: "status" | "alert";
  children?: ReactNode;
}) {
  return (
    <div role={role} className="flex flex-col items-center gap-3 px-4 py-12 text-center text-sm text-muted-foreground">
      {icon}
      <p>{message}</p>
      {children}
    </div>
  );
}

export function DataState({
  loading,
  error,
  empty,
  emptyMessage = "Nenhum registro encontrado.",
  onRetry,
  children,
}: DataStateProps) {
  if (loading) {
    return <StateBox role="status" icon={<Loader2 className="size-5 animate-spin" />} message="Carregando..." />;
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
    return <StateBox role="status" icon={<Inbox className="size-5" />} message={emptyMessage} />;
  }
  return <>{children}</>;
}