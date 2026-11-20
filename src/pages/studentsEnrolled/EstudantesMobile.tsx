import { Mascaras } from "@/hooks/useDadosSensiveis";
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
  mascarar: Mascaras;
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
  mascarar,
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
      <p className="text-caption text-muted-foreground">
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
              className="bg-white border border-border rounded-lg p-3 flex flex-col gap-1"
            >
              <div className="flex items-start gap-2">
                {podeSelecionar && (
                  <input
                    type="checkbox"
                    aria-label={`Selecionar ${e.name} para carteirinha`}
                    checked={selecao!.selecionados.includes(e.id)}
                    onChange={() => alternar(e.id)}
                    className="mt-1 h-5 w-5 accent-primary shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground break-words">
                    {e.name}
                  </p>
                  <p className="text-caption text-muted-foreground break-all">
                    {mascarar.email(e.email)}
                  </p>
                </div>
              </div>
              <p className="text-caption text-foreground">
                Matrícula {e.cod_enrolled} · {e.class?.name ?? "Sem turma"}
                {e.whatsapp && <> · {mascarar.telefone(e.whatsapp)}</>}
              </p>
              <p className="text-body">
                <span className="text-muted-foreground">Status: </span>
                <span className="font-medium">{e.applicationStatus}</span>
              </p>
              <div className="border-t border-border mt-1 pt-1 flex justify-end">
                {renderAcoes(e)}
              </div>
            </li>
          );
        })}
      </ul>

      {estudantes.length === 0 && (
        <p className="text-center text-body text-muted-foreground py-6">
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
            className="h-10 px-4 border border-primary text-foreground rounded-md text-body font-medium disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-body text-muted-foreground">
            {pagina + 1} de {totalDePaginas}
          </span>
          <button
            type="button"
            onClick={() => onPagina(pagina + 1)}
            disabled={pagina + 1 >= totalDePaginas}
            className="h-10 px-4 border border-primary text-foreground rounded-md text-body font-medium disabled:opacity-40"
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  );
}
