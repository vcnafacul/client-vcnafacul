import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import { ReactNode } from "react";

interface Props {
  estudantes: StudentsDtoOutput[];
  /** Página atual, 0-indexada como no DataGrid. */
  pagina: number;
  porPagina: number;
  total: number;
  onPagina: (pagina: number) => void;
  renderAcoes: (estudante: StudentsDtoOutput) => ReactNode;
  /** Só para quem gera carteirinhas (gerenciarEstudantes). */
  selecao?: {
    selecionados: string[];
    selecionavel: (estudante: StudentsDtoOutput) => boolean;
    onChange: (ids: string[]) => void;
  };
}

/**
 * Os estudantes no celular. No DataGrid o nome era a 10ª coluna, fora da tela.
 * A paginação continua no servidor (a mesma do DataGrid), por isso aqui é
 * "anterior/próxima" e não "mostrar mais".
 */
export function EstudantesMobile({
  estudantes,
  pagina,
  porPagina,
  total,
  onPagina,
  renderAcoes,
  selecao,
}: Props) {
  const totalDePaginas = Math.max(1, Math.ceil(total / porPagina));

  const alternar = (id: string) => {
    if (!selecao) return;
    const { selecionados, onChange } = selecao;
    onChange(
      selecionados.includes(id)
        ? selecionados.filter((s) => s !== id)
        : [...selecionados, id],
    );
  };

  return (
    <div className="w-full px-4 flex flex-col gap-3 pb-4">
      <p className="text-xs text-gray-500">
        {total} estudantes
        {selecao && selecao.selecionados.length > 0 && (
          <> · {selecao.selecionados.length} selecionados para carteirinha</>
        )}
      </p>

      <ul className="flex flex-col gap-3">
        {estudantes.map((e) => {
          const podeSelecionar = !!selecao?.selecionavel(e);
          return (
            <li
              key={e.id}
              className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-1"
            >
              <div className="flex items-start gap-2">
                {podeSelecionar && (
                  <input
                    type="checkbox"
                    aria-label={`Selecionar ${e.name} para carteirinha`}
                    checked={selecao!.selecionados.includes(e.id)}
                    onChange={() => alternar(e.id)}
                    className="mt-1 h-5 w-5 accent-marine shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 break-words">
                    {e.name}
                  </p>
                  <p className="text-xs text-gray-500 break-all">{e.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-700">
                Matrícula {e.cod_enrolled} · {e.class?.name ?? "Sem turma"}
                {e.whatsapp && <> · {e.whatsapp}</>}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Status: </span>
                <span className="font-medium">{e.applicationStatus}</span>
              </p>
              <div className="border-t border-gray-100 mt-1 pt-1 flex justify-end">
                {renderAcoes(e)}
              </div>
            </li>
          );
        })}
      </ul>

      {estudantes.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">
          Nenhum estudante encontrado para os filtros selecionados
        </p>
      )}

      {totalDePaginas > 1 && (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between gap-2"
        >
          <button
            type="button"
            onClick={() => onPagina(pagina - 1)}
            disabled={pagina === 0}
            className="h-10 px-4 border border-marine text-marine rounded-md text-sm font-medium disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            {pagina + 1} de {totalDePaginas}
          </span>
          <button
            type="button"
            onClick={() => onPagina(pagina + 1)}
            disabled={pagina + 1 >= totalDePaginas}
            className="h-10 px-4 border border-marine text-marine rounded-md text-sm font-medium disabled:opacity-40"
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  );
}
