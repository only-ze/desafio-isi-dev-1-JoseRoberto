import { Loader2, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  label: string;
  pendingLabel: string;
  icon: LucideIcon;
  pending: boolean;
  retry?: boolean;
  onClick: () => void;
}

export function SubmitButton({ label, pendingLabel, icon: Icon, pending, retry = false, onClick }: SubmitButtonProps) {
  if (pending) {
    return (
      <Button disabled>
        <Loader2 className="animate-spin" /> {pendingLabel}
      </Button>
    );
  }
  return (
    <Button onClick={onClick}>
      {retry ? <RefreshCw /> : <Icon />} {retry ? "Tentar de novo" : label}
    </Button>
  );
}
