import { RadarChart } from "@/components/atoms/radarChart";
import { ClassMonthAnalytics } from "@/types/classAnalytics/classSimuladoAnalytics";
import { formatPercent } from "@/utils/formatPercent";

interface Props {
  materia: ClassMonthAnalytics["materias"][number];
}

export function FrenteRadar({ materia }: Props) {
  if (materia.frentes.length === 0) {
    return (
      <p className="py-2 text-sm text-center text-gray-400">
        Nenhuma frente com dados para {materia.nome}.
      </p>
    );
  }

  const radarData = materia.frentes.map((f) => ({
    frente: f.nome.length > 14 ? f.nome.slice(0, 14) + "…" : f.nome,
    aproveitamento: formatPercent(f.aproveitamento),
  }));

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="h-56 flex-1" aria-label={`Radar de frentes de ${materia.nome}`}>
        <RadarChart
          data={radarData}
          indexBy="frente"
          keys={["aproveitamento"]}
          scheme="greens"
        />
      </div>
      <div className="w-full sm:w-64">
        <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
          Frentes — {materia.nome}
        </p>
        <table className="w-full text-sm" aria-label={`Tabela de frentes de ${materia.nome}`}>
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="pb-1 font-normal">Frente</th>
              <th className="pb-1 font-normal text-right">Aproveito.</th>
              <th className="pb-1 font-normal text-right">Alunos</th>
            </tr>
          </thead>
          <tbody>
            {materia.frentes.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="py-1 pr-2">{f.nome}</td>
                <td className="py-1 text-right">{formatPercent(f.aproveitamento)}%</td>
                <td className="py-1 text-right text-gray-400">n={f.studentsContributing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
