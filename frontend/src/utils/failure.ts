import { errorMessage, isNetworkError } from "@/api/http";

export interface ActionFailure {
  network: boolean;
  message: string;
}

export function toActionFailure(error: unknown): ActionFailure {
  return { network: isNetworkError(error), message: errorMessage(error) };
}
