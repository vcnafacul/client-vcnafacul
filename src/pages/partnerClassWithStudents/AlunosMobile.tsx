import { CancelledStudent } from "@/types/partnerPrepCourse/cancelledStudent";
import { ClassStudent } from "@/types/partnerPrepCourse/classStudent";
import { ReactNode, useMemo, useState } from "react";

/** Quantos cards a lista mostra de cada vez. */
export const TAMANHO_DA_PAGINA = 20;

const pct = (v?: number | null) => (v == null ? "—" : `${v}%`);

type Props =
  | {
      tipo: "ativos";
      alunos: ClassStudent[];
      renderAcoes: (aluno: ClassStudent) => ReactNode;
    }
  | { tipo: "cancelados"; alunos: CancelledStudent[] };

/**
 * Os alunos da turma no celular. No DataGrid o nome era a 4ª coluna e ficava
 * fora da tela. Os cancelados seguem sem ação, como na tabela (a carteirinha
 * mostraria o aluno como matriculado).
 */
export function AlunosMobile(props: Props) {
  const [busca, setBusca] = useState("");
  const [visiveis, setVisiveis] = useState(TAMANHO_DA_PAGINA);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = props.alunos as (ClassStudent | CancelledStudent)[];
    if (!termo) return lista;
    return lista.filter((a) =>
      `${a.name} ${a.email} ${a.cod_enrolled}`.toLowerCase().includes(termo),
    );
  }, [props.alunos, busca]);

  return (
    <div className="w-full px-4 flex flex-col gap-3 py-3">
      <input
        type="search"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setVisiveis(TAMANHO_DA_PAGINA);
        }}
        placeholder="Buscar por nome, email ou matrícula"
        aria-label="Buscar aluno"
        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
      />
      <p className="text-xs text-gray-500">
        {filtrados.length} de {props.alunos.length}{" "}
        {props.tipo === "ativos" ? "alunos" : "matrículas canceladas"}
      </p>

      <ul className="flex flex-col gap-3">
        {filtrados.slice(0, visiveis).map((aluno) => (
          <li
            key={aluno.id}
            className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-1"
          >
            <p className="font-semibold text-gray-900 break-words">
              {aluno.name}
            </p>
            <p className="text-xs text-gray-500 break-all">{aluno.email}</p>
            <p className="text-xs text-gray-600">
              Matrícula {aluno.cod_enrolled}
            </p>

            {props.tipo === "ativos" ? (
              <>
                <p className="text-xs text-gray-700">
                  Presença {pct((aluno as ClassStudent).presencePercentage)} ·
                  Faltas {pct((aluno as ClassStudent).absencePercentage)} ·
                  Just. {pct((aluno as ClassStudent).justifiedAbsencePercentage)}
                </p>
                <div className="border-t border-gray-100 mt-1 pt-1 flex justify-end">
                  {props.renderAcoes(aluno as ClassStudent)}
                </div>
              </>
            ) : (
              <>
                {(aluno as CancelledStudent).cancelledAt && (
                  <p className="text-xs text-gray-700">
                    Cancelado em{" "}
                    {new Date(
                      (aluno as CancelledStudent).cancelledAt!,
                    ).toLocaleDateString("pt-BR")}
                  </p>
                )}
                <p className="text-xs text-gray-600 break-words">
                  {(aluno as CancelledStudent).justification ?? "—"}
                </p>
              </>
            )}
          </li>
        ))}
      </ul>

      {filtrados.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">
          {props.tipo === "ativos"
            ? "Nenhum aluno encontrado"
            : "Nenhuma matrícula cancelada nesta turma"}
        </p>
      )}

      {visiveis < filtrados.length && (
        <button
          type="button"
          onClick={() => setVisiveis((v) => v + TAMANHO_DA_PAGINA)}
          className="h-10 w-full border border-marine text-marine rounded-md text-sm font-medium"
        >
          Mostrar mais ({filtrados.length - visiveis} restantes)
        </button>
      )}
    </div>
  );
}
