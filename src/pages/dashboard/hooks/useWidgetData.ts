import { useCallback, useEffect, useState } from 'react';

interface UseWidgetDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useWidgetData<T>(
  fetchFn: () => Promise<T>,
): UseWidgetDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return { data, isLoading, error, retry };
}
