import { RichTextRenderer } from "@/components/atoms/richTextRenderer/RichTextRenderer";
import { Atualizacao, AtualizacoesDaProva } from "@/dtos/prova/atualizacao";
import { Question } from "@/dtos/question/questionDTO";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { CAMPOS_COMPARADOS } from "@/pages/dashQuestionNew/modals/tabs/TabConteudo/escolhaAoSalvar";
import {
  aplicarAtualizacoes,
  listarAtualizacoes,
} from "@/services/prova/atualizacoes";
import { getQuestionById } from "@/services/question/getQuestionById";
import { useState } from "react";
import { toast } from "react-toastify";

/**
 * "Buscar atualizações" da prova (tickets/023, card 15, regra R6).
 *
 * Numa prova com versões fixas, as questões ficam na versão em que foram
 * montadas. Aqui o dono vê o que tem versão mais nova e escolhe, uma a uma, o
 * que atualizar — na prova e nos simulados dela. Quem não é dono vê a lista
 * só para leitura.
 *
 * ⚠️ Carrega sob demanda (no clique), para não pesar a abertura da prova.
 */
export const TEXTO_VAZIO =
  "Nenhuma atualização — a prova está com as versões mais recentes.";
export const TEXTO_EM_REVISAO =
  "Esta versão ainda não foi revisada pela comunidade. Você pode usá-la mesmo assim, ou ajudar a revisar.";
export const TEXTO_CADEIA_INTERROMPIDA =
  "Uma versão mais nova foi excluída; esta é a última disponível.";
export const TEXTO_CONFIRMAR_APLICAR =
  "As questões selecionadas serão trocadas nesta prova e nos simulados dela. Quem já fez a prova continua vendo a versão que respondeu.";

const ROTULO_DO_STATUS: Record<number, string> = {
  [StatusEnum.Approved]: "Aprovada",
  [StatusEnum.Pending]: "Em revisão",
  [StatusEnum.Rejected]: "Recusada",
};

const ROTULO_DO_CAMPO: Record<string, string> = Object.fromEntries(
  CAMPOS_COMPARADOS.map(({ campo, rotulo }) => [campo, rotulo]),
);

export function BuscarAtualizacoes({
  provaId,
  token,
}: {
  provaId: string;
  token: string;
}) {
  const [dados, setDados] = useState<AtualizacoesDaProva | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [aplicando, setAplicando] = useState(false);

  const buscar = async () => {
    setCarregando(true);
    try {
      setDados(await listarAtualizacoes(provaId, token));
      setSelecionadas(new Set());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  const alternar = (id: string) =>
    setSelecionadas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const aplicar = async () => {
    if (!dados || selecionadas.size === 0) return;
    if (!window.confirm(TEXTO_CONFIRMAR_APLICAR)) return;
    setAplicando(true);
    try {
      const trocas = dados.atualizacoes
        .filter((a) => selecionadas.has(a.atual._id))
        .map((a) => ({ de: a.atual._id, para: a.oferta._id }));
      await aplicarAtualizacoes(provaId, trocas, token);
      toast.success(
        trocas.length === 1
          ? "1 questão atualizada."
          : `${trocas.length} questões atualizadas.`,
      );
      await buscar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAplicando(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={buscar}
        disabled={carregando}
        className="self-start rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        {carregando ? "Buscando…" : "Buscar atualizações"}
      </button>

      {dados && dados.atualizacoes.length === 0 && (
        <p className="text-sm text-gray-600">{TEXTO_VAZIO}</p>
      )}

      {dados && dados.atualizacoes.length > 0 && (
        <>
          <ul className="flex flex-col gap-2" data-atualizacoes>
            {dados.atualizacoes.map((a) => (
              <LinhaDeAtualizacao
                key={a.atual._id}
                atualizacao={a}
                token={token}
                podeAplicar={dados.podeComporProva}
                selecionada={selecionadas.has(a.atual._id)}
                onAlternar={() => alternar(a.atual._id)}
              />
            ))}
          </ul>
          {dados.podeComporProva && (
            <button
              type="button"
              onClick={aplicar}
              disabled={aplicando || selecionadas.size === 0}
              className="self-end rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Aplicar selecionadas
            </button>
          )}
        </>
      )}
    </div>
  );
}

function LinhaDeAtualizacao({
  atualizacao: a,
  token,
  podeAplicar,
  selecionada,
  onAlternar,
}: {
  atualizacao: Atualizacao;
  token: string;
  podeAplicar: boolean;
  selecionada: boolean;
  onAlternar: () => void;
}) {
  const [comparando, setComparando] = useState<[Question, Question] | null>(
    null,
  );
  const saltos =
    a.oferta.saltos === 1 ? "+1 versão" : `+${a.oferta.saltos} versões`;
  const titulo = a.numero != null ? `Questão ${a.numero}` : "Questão sem número";

  const comparar = async () => {
    if (comparando) return setComparando(null);
    try {
      setComparando(
        await Promise.all([
          getQuestionById(token, a.atual._id),
          getQuestionById(token, a.oferta._id),
        ]),
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <li className="rounded-lg border border-gray-200 p-3 text-sm">
      <div className="flex items-start gap-3">
        {podeAplicar && (
          <input
            type="checkbox"
            aria-label={`Aplicar em ${titulo}`}
            className="mt-1 h-4 w-4"
            checked={selecionada}
            onChange={onAlternar}
          />
        )}
        <div className="flex-1">
          <p>
            <strong>{titulo}</strong> · versão atual → versão nova ({saltos}) ·{" "}
            <span data-status>{ROTULO_DO_STATUS[a.oferta.status] ?? "—"}</span>
          </p>
          {a.camposAlterados.length > 0 && (
            <p className="text-xs text-gray-600">
              Mudou:{" "}
              {a.camposAlterados.map((c) => ROTULO_DO_CAMPO[c] ?? c).join(", ")}
            </p>
          )}
          {a.oferta.status === StatusEnum.Pending && (
            <p className="text-xs text-amber-700">{TEXTO_EM_REVISAO}</p>
          )}
          {a.cadeiaInterrompida && (
            <p className="text-xs text-gray-600">{TEXTO_CADEIA_INTERROMPIDA}</p>
          )}
          <button
            type="button"
            onClick={comparar}
            className="mt-1 text-xs text-blue-700 underline underline-offset-2"
          >
            {comparando ? "Fechar comparação" : "Ver lado a lado"}
          </button>
          {comparando && (
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2" data-comparacao>
              {comparando.map((q, i) => (
                <div key={q._id} className="rounded border border-gray-100 p-2">
                  <p className="mb-1 text-xs font-semibold text-gray-500">
                    {i === 0 ? "Atual" : "Nova"}
                  </p>
                  <RichTextRenderer
                    content={q.textoQuestao ?? ""}
                    contentFormat={q.contentFormat}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
