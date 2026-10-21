import { useRef, useState } from "react";
import { notifyError, notifySuccess } from "@/utils/notify";

interface ActionOptions<TResult> {
  successMessage?: string | ((result: TResult) => string);
  onSuccess?: (result: TResult) => void;
}

export function useAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options: ActionOptions<TResult> = {},
) {
  const [pending, setPending] = useState(false);
  const running = useRef(false);

  async function run(...args: TArgs): Promise<TResult | undefined> {
    if (running.current) return undefined;
    running.current = true;
    setPending(true);
    try {
      const result = await action(...args);
      const { successMessage } = options;
      if (successMessage) {
        notifySuccess(typeof successMessage === "function" ? successMessage(result) : successMessage);
      }
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      notifyError(error);
      return undefined;
    } finally {
      running.current = false;
      setPending(false);
    }
  }

  return { run, pending };
}