import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";

interface Props {
  months: ClassMonthsList["months"];
  value: string | null;
  onChange: (month: string) => void;
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return date.toLocaleString("pt-BR", { month: "long", year: "numeric" });
}

export function MonthPicker({ months, value, onChange }: Props) {
  if (months.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Mês:</span>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecione um mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.month} value={m.month}>
              {formatMonthLabel(m.month)} — {m.studentsWithAtLeastOneCompletedAttempt} alunos | {Math.round(m.geral)}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
