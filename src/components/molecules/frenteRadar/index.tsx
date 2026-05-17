import { RadarChart } from "@/components/atoms/radarChart";
import { ClassMonthAnalytics } from "@/types/classAnalytics/classSimuladoAnalytics";
import { formatPercent } from "@/utils/formatPercent";

interface Props {
  materias: ClassMonthAnalytics["materias"];
  title?: string;
}

type FlatFrente = {
  key: string;
  nome: string;
  materiaNome: string;
  aproveitamento: number;
  studentsContributing: number;
};

export function FrenteRadar({ materias, title }: Props) {
  const flat: FlatFrente[] = materias.flatMap((m) =>
    m.frentes.map((f) => ({
      key: `${m.id}-${f.id}`,
      nome: f.nome,
      materiaNome: m.nome,
      aproveitamento: f.aproveitamento,
      studentsContributing: f.studentsContributing,
    })),
  );

  if (flat.length === 0) {
    return (
      <p className="py-2 text-sm text-center text-gray-400">
        Nenhuma frente com dados.
      </p>
    );
  }

  const multipleMaterias = materias.length > 1;
  const heading = title ?? (multipleMaterias ? "Frentes" : `Frentes — ${materias[0].nome}`);

  const radarData = flat.map((f) => ({
    frente: f.nome.length > 14 ? f.nome.slice(0, 14) + "…" : f.nome,
    aproveitamento: formatPercent(f.aproveitamento),
  }));

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="h-56 flex-1" aria-label={`Radar de frentes${multipleMaterias ? "" : ` de ${materias[0].nome}`}`}>
        <RadarChart
          data={radarData}
          indexBy="frente"
          keys={["aproveitamento"]}
        />
      </div>
      <div className="w-full sm:w-64">
        <p className="mb-1 text-xs font-medium text-gray-500 uppercase">{heading}</p>
        <table className="w-full text-sm" aria-label="Tabela de frentes">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="pb-1 font-normal">Frente</th>
              {multipleMaterias && <th className="pb-1 font-normal">Matéria</th>}
              <th className="pb-1 font-normal text-right">Aproveito.</th>
              <th className="pb-1 font-normal text-right">Alunos</th>
            </tr>
          </thead>
          <tbody>
            {flat.map((f) => (
              <tr key={f.key} className="hover:bg-gray-50">
                <td className="py-1 pr-2">{f.nome}</td>
                {multipleMaterias && <td className="py-1 pr-2 text-gray-500">{f.materiaNome}</td>}
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
