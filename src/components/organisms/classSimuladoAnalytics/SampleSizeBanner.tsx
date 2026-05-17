import { AlertTriangle } from "lucide-react";
import { ClassMonthAnalytics } from "@/types/classAnalytics/classSimuladoAnalytics";

interface Props {
  monthData: ClassMonthAnalytics;
  totalStudents: number;
}

export function SampleSizeBanner({ monthData, totalStudents }: Props) {
  const threshold = Math.max(3, Math.floor(totalStudents * 0.1));
  if (monthData.studentsWithAtLeastOneCompletedAttempt >= threshold) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Amostra pequena: apenas {monthData.studentsWithAtLeastOneCompletedAttempt} aluno(s) com simulado completo.
        Os dados podem não ser representativos.
      </span>
    </div>
  );
}
