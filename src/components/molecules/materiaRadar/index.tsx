import { RadarChart } from "@/components/atoms/radarChart";
import { ClassMonthAnalytics } from "@/types/classAnalytics/classSimuladoAnalytics";
import { formatPercent } from "@/utils/formatPercent";

interface Props {
  materias: ClassMonthAnalytics["materias"];
  onSelectMateria: (id: string | undefined) => void;
  selectedMateriaId: string | undefined;
}

export function MateriaRadar({ materias, onSelectMateria, selectedMateriaId }: Props) {
  if (materias.length === 0) {
    return (
      <p className="py-4 text-body text-center text-muted-foreground">
        Nenhuma matéria com dados para este mês.
      </p>
    );
  }

  const radarData = materias.map((m) => ({
    materia: m.nome.length > 12 ? m.nome.slice(0, 12) + "…" : m.nome,
    aproveitamento: formatPercent(m.aproveitamento),
  }));

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="h-64 flex-1" aria-label="Radar de desempenho por matéria">
        <RadarChart data={radarData} indexBy="materia" keys={["aproveitamento"]} />
      </div>
      <div className="w-full sm:w-64">
        <p className="mb-1 text-caption font-medium text-muted-foreground uppercase">Matérias</p>
        <table className="w-full text-body" role="table" aria-label="Tabela de matérias">
          <thead>
            <tr className="text-left text-caption text-muted-foreground">
              <th className="pb-1 font-normal">Matéria</th>
              <th className="pb-1 font-normal text-right">Aproveito.</th>
              <th className="pb-1 font-normal text-right">Alunos</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr
                key={m.id}
                onClick={() => onSelectMateria(selectedMateriaId === m.id ? undefined : m.id)}
                className={`cursor-pointer rounded-sm transition-colors hover:bg-page ${
                  selectedMateriaId === m.id ? "bg-info-muted font-medium" : ""
                }`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectMateria(selectedMateriaId === m.id ? undefined : m.id);
                  }
                }}
                aria-pressed={selectedMateriaId === m.id}
              >
                <td className="py-1 pr-2">{m.nome}</td>
                <td className="py-1 text-right">{formatPercent(m.aproveitamento)}%</td>
                <td className="py-1 text-right text-muted-foreground">n={m.studentsContributing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
