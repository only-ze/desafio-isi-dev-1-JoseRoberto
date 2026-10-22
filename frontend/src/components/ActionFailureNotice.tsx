import { errorMessage, isNetworkError } from "@/api/http";
import { Notice } from "@/components/Notice";

export interface ActionFailure {
  network: boolean;
  message: string;
}

export function toActionFailure(error: unknown): ActionFailure {
  return { network: isNetworkError(error), message: errorMessage(error) };
}

interface ActionFailureNoticeProps {
  failure: ActionFailure | null;
  refusedTitle: string;
  action: string;
}

export function ActionFailureNotice({ failure, refusedTitle, action }: ActionFailureNoticeProps) {
  if (!failure) return null;
  if (failure.network) {
    return (
      <Notice tone="error" title="Sem conexão">
        A {action} não foi confirmada. Verifique a conexão e tente de novo.
      </Notice>
    );
  }
  return (
    <Notice tone="error" title={refusedTitle}>
      {failure.message}
    </Notice>
  );
}
