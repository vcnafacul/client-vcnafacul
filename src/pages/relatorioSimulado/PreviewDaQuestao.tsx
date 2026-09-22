import { dashV2 } from "@/components/dashV2";
import { RichTextRenderer } from "@/components/atoms/richTextRenderer/RichTextRenderer";
import ModalTemplate from "@/components/templates/modalTemplate";
import type { Question } from "@/dtos/question/questionDTO";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { getQuestionById } from "@/services/question/getQuestionById";
import { LETRAS, textosDasAlternativas } from "./alternativasDaQuestao";
import { useCallback, useEffect, useState } from "react";
import { formatarPercentual, percentualDaAlternativa } from "./percentuais";

export const TEXTO_ERRO =
  "Não foi possível carregar o enunciado desta questão.";
export const TEXTO_SEM_ALTERNATIVAS =
  "As alternativas desta questão não estão em texto — provavelmente fazem parte da imagem do enunciado.";
export const TEXTO_PODE_TER_MUDADO =
  "O enunciado e o gabarito mostrados aqui são os do banco de questões HOJE. A questão pode ter sido editada depois da aplicação.";

/**
 * Preview do enunciado, aberto a partir de uma linha da aba de Questões.
 *
 * ⚠️ **É preview, e não link para a tela do banco de questões** — decisão do
 * card 11, tomada por investigação e não por gosto:
 *
 * 1. **Não existe rota por questão.** `DASH_QUESTION` é uma listagem cujo modal
 *    é controlado por estado local (`selectedQuestionId`); não há
 *    `useSearchParams` nem `:id` em lugar nenhum, então não há URL para abrir
 *    numa aba nova.
 * 2. **A permissão não bate.** O relatório é guardado por `gerenciarEstudantes`
 *    e o banco por `visualizarQuestao` — são colunas independentes em `roles`.
 *    Um coordenador de cursinho com o relatório aberto pode perfeitamente não
 *    ter a segunda, e a `ProtectedRoutePermission` redireciona **calada** (há
 *    comentário registrando isso no `PlatformRoutes`). O card pede o oposto:
 *    não oferecer caminho que só sabe dar 403.
 *
 * ⚠️ **O gabarito exibido é o do RELATÓRIO, não o do banco.** São coisas
 * diferentes: `alternativaCorreta` é o gabarito com que os cartões foram
 * corrigidos; `questao.alternativa` é o que está no banco agora. Quando
 * divergem, a tela diz — é o caso "questão editada depois da aplicação" que o
 * card manda tratar, e o silêncio aqui faria o professor conferir a correção
 * contra um gabarito que não foi o usado.
 */
export function PreviewDaQuestao({
  token,
  questao,
  isOpen,
  onClose,
  buscar = getQuestionById,
}: {
  token: string;
  questao: QuestaoDoRelatorio;
  isOpen: boolean;
  onClose: () => void;
  /** Injetável para teste; em produção é sempre o serviço real. */
  buscar?: (token: string, questaoId: string) => Promise<Question>;
}) {
  const [dados, setDados] = useState<Question | null>(null);
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("loading");

  const carregar = useCallback(() => {
    // ⚠️ Só com o modal aberto — mesma regra do `DetalheDoEstudante`. A tabela
    // tem até 25 linhas por página; buscar sempre seria 25 chamadas por página.
    if (!isOpen) return;
    setEstado("loading");
    buscar(token, questao.questaoId)
      .then((q) => {
        setDados(q);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  }, [isOpen, token, questao.questaoId, buscar]);

  useEffect(carregar, [carregar]);

  const formato = dados?.contentFormat ?? "plain";
  const alternativas = dados === null ? [] : textosDasAlternativas(dados);
  const semAlternativasEmTexto =
    dados !== null && alternativas.every((t) => t.trim() === "");

  /*
    ⚠️ Só compara quando os DOIS existem. `alternativaCorreta` é `null` quando o
    recorte não sabe o gabarito (nenhum histórico completo, ou históricos que
    discordam) e `alternativa` pode faltar numa questão em rascunho — em
    nenhum dos dois casos há divergência a anunciar, há ausência de dado.
  */
  const gabaritoDoBanco = dados?.alternativa ?? null;
  const divergeOGabarito =
    questao.alternativaCorreta !== null &&
    gabaritoDoBanco !== null &&
    gabaritoDoBanco !== "" &&
    gabaritoDoBanco !== questao.alternativaCorreta;

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={onClose}
      className="w-full max-w-3xl rounded-lg bg-white p-4 shadow-xl"
    >
      <div className="flex flex-col gap-4" data-testid="preview-da-questao">
        <header className="flex flex-col gap-1">
          <h2 className={cn("text-lg font-semibold", dashV2.text.primary)}>
            {questao.numero === null
              ? "Questão sem número"
              : `Questão ${questao.numero}`}
          </h2>
          <p className={cn("text-xs", dashV2.text.secondary)}>
            {questao.respondentes} respondente(s) neste recorte
          </p>
        </header>

        {estado === "loading" && (
          <div
            data-testid="preview-carregando"
            className="h-40 animate-pulse rounded-md bg-gray-100"
          />
        )}

        {estado === "error" && (
          <div className="flex flex-col items-start gap-2">
            <p className={cn("text-sm", dashV2.text.primary)}>{TEXTO_ERRO}</p>
            <button
              type="button"
              onClick={carregar}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm",
                dashV2.border,
                dashV2.text.secondary,
                dashV2.focus,
              )}
            >
              Tentar de novo
            </button>
          </div>
        )}

        {estado === "idle" && dados !== null && (
          <>
            <RichTextRenderer
              content={dados.textoQuestao ?? ""}
              contentFormat={formato}
            />
            {(dados.pergunta ?? "").trim() !== "" && (
              <RichTextRenderer
                content={dados.pergunta}
                contentFormat={formato}
              />
            )}

            {semAlternativasEmTexto ? (
              <p className={cn("text-sm", dashV2.text.secondary)}>
                {TEXTO_SEM_ALTERNATIVAS}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {LETRAS.map((letra, i) => {
                  const correta = questao.alternativaCorreta === letra;
                  return (
                    <li
                      key={letra}
                      data-alternativa={letra}
                      data-correta={correta ? "sim" : undefined}
                      className={cn(
                        "flex items-start gap-3 rounded-md border px-3 py-2",
                        correta
                          ? "border-green-500 bg-green-50"
                          : cn(dashV2.border, dashV2.surface),
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold",
                          correta ? "text-green-700" : dashV2.text.primary,
                        )}
                      >
                        {letra}
                      </span>
                      <div className="min-w-0 flex-1">
                        <RichTextRenderer
                          content={alternativas[i]}
                          contentFormat={formato}
                        />
                      </div>
                      {/*
                        ⚠️ A distribuição ao lado do texto é o ponto do card: é
                        ela que transforma "51% marcaram B" em diagnóstico. Ler
                        o distrator que levou metade da turma, com o percentual
                        do lado, é o que fecha a triagem do card 06.
                      */}
                      <span
                        data-testid={`preview-pct-${letra}`}
                        className={cn(
                          "shrink-0 text-sm tabular-nums",
                          dashV2.text.secondary,
                        )}
                      >
                        {formatarPercentual(
                          percentualDaAlternativa(questao, letra),
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {divergeOGabarito && (
              <p
                data-testid="preview-gabarito-divergente"
                className="rounded-md border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                O gabarito desta questão no banco hoje é {gabaritoDoBanco}, e os
                cartões deste simulado foram corrigidos por{" "}
                {questao.alternativaCorreta}. O destaque acima segue o gabarito
                da correção.
              </p>
            )}

            <p className={cn("text-xs", dashV2.text.muted)}>
              {TEXTO_PODE_TER_MUDADO}
            </p>
          </>
        )}
      </div>
    </ModalTemplate>
  );
}

export default PreviewDaQuestao;
