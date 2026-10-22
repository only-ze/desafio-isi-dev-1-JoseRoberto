import { toast } from "sonner";
import { errorMessage } from "@/api/http";

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyError(error: unknown): void {
  toast.error(errorMessage(error));
}
