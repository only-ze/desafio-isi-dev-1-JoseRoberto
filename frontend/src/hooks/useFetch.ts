import { useCallback, useEffect, useState } from "react";
import { ApiError, errorMessage } from "@/api/http";

interface Result<T> {
  fetcher: unknown;
  version: number;
  data: T | null;
  error: string | null;
  errorStatus: number | null;
}

export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setResult({ fetcher, version, data, error: null, errorStatus: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult((previous) => ({
          fetcher,
          version,
          data: previous?.data ?? null,
          error: errorMessage(error),
          errorStatus: error instanceof ApiError ? error.status : null,
        }));
      });
    return () => controller.abort();
  }, [fetcher, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  const settled = result !== null && result.fetcher === fetcher && result.version === version;
  const data = result?.data ?? null;

  return {
    data,
    error: settled ? result.error : null,
    errorStatus: settled ? result.errorStatus : null,
    loading: !settled && data === null,
    refreshing: !settled && data !== null,
    reload,
  };
}
