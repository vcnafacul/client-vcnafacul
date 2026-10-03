import { Link } from "react-router-dom";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { InfoDaMetrica } from "@/components/indicadores/InfoDaMetrica";
import { Panel } from "@/pages/dashboard/components/Panel";
import { caminhoDaTurma } from "@/pages/partnerClassWithStudents/abaDaTurma";
import { DASH, PARTNER_CLASS } from "@/routes/path";
import type { TurmaDoIndicador } from "@/services/indicadores";
import { colunasBase, type ColunaDaTurma } from "./colunasDaTurma";
import { explicacoes } from "./explicacoes";
import { rankingDeEvasao, type TurmaNoRanking } from "./turmas";

/**
 * Turmas do período, da maior para a menor evasão (tickets/033, card 06).
 * Abaixo de `sm` vira lista de cartões, como o `DashTable`.
 */
export function TabelaDeTurmas({
  turmas,
  colunas = colunasBase,
}: {
  turmas: TurmaDoIndicador[];
  colunas?: ColunaDaTurma[];
}) {
  const acimaDeSm = useAcimaDeSm();
  const { turmas: ordenadas, destaqueId } = rankingDeEvasao(turmas);
  const linkDa = (id: string) =>
    caminhoDaTurma(`${DASH}/${PARTNER_CLASS}`, id);

  const nome = (t: TurmaNoRanking) => (
    <span className="flex flex-wrap items-center gap-2">
      <Link
        to={linkDa(t.id)}
        className="font-medium text-marine underline-offset-2 hover:underline"
      >
        {t.nome}
      </Link>
      {t.id === destaqueId && (
        <span className="rounded-full bg-red/[0.10] px-2 py-0.5 text-xs font-semibold text-red">
          Maior evasão
        </span>
      )}
    </span>
  );

  return (
    <Panel
      title="Turmas"
      subtitle="Da maior para a menor evasão"
      action={
        <InfoDaMetrica
          metrica="Turma com maior evasão"
          explicacao={explicacoes.turmaComMaiorEvasao}
        />
      }
    >
      {ordenadas.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Nenhuma turma neste período.
        </p>
      ) : acimaDeSm ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4 font-medium">Turma</th>
                {colunas.map((c) => (
                  <th key={c.titulo} className="px-3 py-2 text-right font-medium">
                    {c.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">{nome(t)}</td>
                  {colunas.map((c) => (
                    <td
                      key={c.titulo}
                      className="px-3 py-3 text-right tabular-nums lining-nums text-slate-700"
                    >
                      {c.valor(t)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {ordenadas.map((t) => (
            <li key={t.id} className="py-3">
              {nome(t)}
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {colunas.map((c) => (
                  <div key={c.titulo} className="flex justify-between gap-2">
                    <dt className="text-slate-500">{c.titulo}</dt>
                    <dd className="tabular-nums lining-nums text-slate-700">
                      {c.valor(t)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
