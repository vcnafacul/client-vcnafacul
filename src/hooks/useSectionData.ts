// client-vcnafacul/src/hooks/useSectionData.ts
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface State<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export function useSectionData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: React.DependencyList = [],
): State<T> {
  const [state, setState] = useState<State<T>>({
    data: fallback,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let mounted = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (!mounted) return;
        setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!mounted) return;
        toast.error(err.message);
        setState({ data: fallback, loading: false, error: err });
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
