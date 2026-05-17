import { useEffect, useState } from "react";
import { ClassMonthAnalytics } from "@/types/classAnalytics/classSimuladoAnalytics";
import { getClassSimuladoByMonth } from "@/services/prepCourse/class/getClassSimuladoByMonth";

export function useRefreshPolling(
  classId: string,
  month: string,
  baselineGeneratedAt: string | null,
  token: string,
  enabled: boolean
) {
  const [polling, setPolling] = useState(enabled);
  const [latest, setLatest] = useState<ClassMonthAnalytics | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setPolling(enabled);
    setLatest(null);
    setTimedOut(false);
  }, [enabled]);

  useEffect(() => {
    if (!polling) return;
    const start = Date.now();
    const intervalId = setInterval(async () => {
      try {
        const data = await getClassSimuladoByMonth(classId, month, token);
        if (data && data.generatedAt !== baselineGeneratedAt) {
          setLatest(data);
          setPolling(false);
        } else if (Date.now() - start > 90_000) {
          setTimedOut(true);
          setPolling(false);
        }
      } catch {
        // silently ignore transient errors during polling
      }
    }, 10_000);
    return () => clearInterval(intervalId);
  }, [polling, classId, month, baselineGeneratedAt, token]);

  return { polling, latest, timedOut };
}
