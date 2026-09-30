import { Bool } from "@/enums/bool";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { ReactNode, useMemo, useState } from "react";

/** Quantos cards a lista mostra de cada vez. */
export const TAMANHO_DA_PAGINA = 20;

interface Props {
  inscritos: XLSXStudentCourseFull[];
  rankingMap: Map<string, number> | null;
  renderAcoes: (inscrito: XLSXStudentCourseFull) => ReactNode;
}

const dataCurta = (data: Date | string | null) =>
  data ? new Date(data).toLocaleDateString("pt-BR") : null;

function Marca({ ativo, children }: { ativo: boolean; children: ReactNode }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${
        ativo
          ? "bg-marine/10 border-marine/30 text-marine font-semibold"
          : "border-gray-200 text-gray-400"
      }`}
    >
      {children}
    </span>
  );
}

/**
 * Os inscritos no celular: um card por pessoa no lugar do DataGrid, que em
 * 375px só mostrava a coluna de ações — nome e status ficavam no fim do
 * scroll lateral. As ações são as mesmas da tabela (`renderAcoes`).
 */
export function ListaDeInscritosMobile({
  inscritos,
  rankingMap,
  renderAcoes,
}: Props) {
  const [busca, setBusca] = useState("");
  const [visiveis, setVisiveis] = useState(TAMANHO_DA_PAGINA);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return inscritos;
    return inscritos.filter((i) =>
      `${i.nome} ${i.sobrenome} ${i.email} ${i.cpf}`
        .toLowerCase()
        .includes(termo),
    );
  }, [inscritos, busca]);

  return (
    <div className="w-full px-4 flex flex-col gap-3 pb-4">
      <input
        type="search"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setVisiveis(TAMANHO_DA_PAGINA);
        }}
        placeholder="Buscar por nome, email ou CPF"
        aria-label="Buscar inscrito"
        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
      />
      <p className="text-xs text-gray-500">
        {filtrados.length} de {inscritos.length} inscritos
      </p>

      <ul className="flex flex-col gap-3">
        {filtrados.slice(0, visiveis).map((inscrito) => {
          const posicao = rankingMap?.get(inscrito.userId);
          const convocacao = dataCurta(inscrito.data_convocacao);
          const prazo = dataCurta(inscrito.data_limite_convocacao);
          return (
            <li
              key={inscrito.id}
              className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="flex items-start gap-2">
                {posicao != null && (
                  <span className="text-sm font-bold text-marine shrink-0">
                    {posicao}º
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 break-words">
                    {capitalizeWords(`${inscrito.nome} ${inscrito.sobrenome}`)}
                  </p>
                  <p className="text-xs text-gray-500 break-all">
                    {inscrito.email}
                  </p>
                </div>
              </div>

              <p className="text-sm">
                <span className="text-gray-500">Status: </span>
                <span className="font-medium">{inscrito.status}</span>
              </p>

              <div className="flex flex-wrap gap-1.5">
                <Marca ativo={inscrito.isento === Bool.Yes}>Isento</Marca>
                <Marca ativo={inscrito.lista_de_espera === Bool.Yes}>
                  Lista de espera
                </Marca>
                <Marca ativo={inscrito.convocar === Bool.Yes}>
                  Lista de convocação
                </Marca>
              </div>

              {(convocacao || prazo) && (
                <p className="text-xs text-gray-600">
                  {convocacao && <>Convocado em {convocacao}</>}
                  {convocacao && prazo && " · "}
                  {prazo && <>Prazo {prazo}</>}
                </p>
              )}

              <div className="border-t border-gray-100 pt-2 [&>div]:h-auto [&>div]:justify-start">
                {renderAcoes(inscrito)}
              </div>
            </li>
          );
        })}
      </ul>

      {filtrados.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">
          Nenhum inscrito encontrado
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
