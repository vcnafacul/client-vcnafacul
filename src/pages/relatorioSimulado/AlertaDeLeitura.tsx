import { dashV2 } from "@/components/dashV2";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type {
  LeituraAnormalDasQuestoes,
  LeituraAnormalDosCartoes,
} from "./leituraAnormal";
import { percentualSemLeitura } from "./leituraAnormal";
import { faixaDePercentuais, listaDeNumeros } from "./textoDoAlerta";

/**
 * A faixa de aviso. ⚠️ Mesmas cores do `SampleSizeBanner` — as duas dizem "a
 * base não é o que parece", e avisar com dois desenhos diferentes sobre a mesma
 * classe de problema faz a pessoa procurar uma diferença que não existe.
 */
function Faixa({
  children,
  testId,
}: {
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <div
      data-testid={testId}
      className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Os alertas de qualidade de leitura, acima das abas.
 *
 * ⚠️ **Acima das abas, e os DOIS juntos** — inclusive o de cartão, que o card 12
 * localizava "na aba de Estudantes". São a mesma classe de achado (a leitura
 * falhou, os números abaixo não valem), e quem está na aba de Questões precisa
 * saber do cartão tanto quanto o contrário. Dentro de uma aba, cada alerta só
 * seria visto por quem já estava olhando o lugar certo — que é exatamente o
 * problema que o card descreve.
 *
 * ⚠️ **Não é `print:hidden`.** Numa folha impressa a ressalva importa mais, não
 * menos: quem lê o papel não tem como conferir a base em lugar nenhum. Mesma
 * decisão do `SampleSizeBanner`.
 *
 * ⚠️ **Nada quando não há o que dizer.** O componente devolve `null` — não uma
 * faixa verde dizendo "leitura OK". Aviso que aparece sempre deixa de ser aviso.
 */
export function AlertaDeLeitura({
  questoes,
  cartoes,
  aoAbrirCartao,
}: {
  questoes: LeituraAnormalDasQuestoes;
  cartoes: LeituraAnormalDosCartoes;
  /**
   * O que fazer ao clicar num nome.
   *
   * ⚠️ **Obrigatório, e leva ao modal onde vive o `AcaoDeReenvio`.** O card é
   * explícito: um cartão com leitura ruim que não falhou NUNCA entra na fila de
   * trabalho do coordenador — o status dele é "Lido". Um alerta que só informa
   * o deixaria exatamente onde estava.
   */
  aoAbrirCartao: (linha: LinhaDoRelatorio) => void;
}) {
  const temQuestoes = questoes.questoes.length > 0;
  const temCartoes = cartoes.cartoes.length > 0;
  if (!temQuestoes && !temCartoes) return null;

  return (
    <div className="flex flex-col gap-2" data-testid="alertas-de-leitura">
      {temQuestoes && (
        <Faixa testId="alerta-leitura-questoes">
          <strong>
            {questoes.questoes.length} quest
            {questoes.questoes.length === 1 ? "ão" : "ões"} com leitura anormal
          </strong>{" "}
          ({listaDeNumeros(questoes.questoes.map((q) => q.numero))}) —{" "}
          {/*
            ⚠️ Pelo `percentualSemLeitura`, e não por uma divisão escrita aqui:
            é a MESMA conta que decidiu quem entra no alerta. Duas contas
            divergiriam no arredondamento e o alerta acusaria uma questão
            citando um percentual que não cruza o próprio limiar.
          */}
          {faixaDePercentuais(
            questoes.questoes
              .map(percentualSemLeitura)
              .filter((p): p is number => p !== null),
          )}{" "}
          dos cartões não tiveram marcação legível nessas questões, contra{" "}
          {Math.round(questoes.mediana ?? 0)}% no resto do simulado. Verifique o
          gabarito impresso antes de usar os percentuais delas.
        </Faixa>
      )}

      {temCartoes && (
        <Faixa testId="alerta-leitura-cartoes">
          <strong>
            {cartoes.cartoes.length} cart
            {cartoes.cartoes.length === 1 ? "ão" : "ões"} com leitura anormal
          </strong>{" "}
          — abra para reenviar a foto:{" "}
          {cartoes.cartoes.map((c, i) => (
            <span key={`${c.linha.usuario}:${c.linha.matricula}`}>
              {i > 0 && ", "}
              <button
                type="button"
                onClick={() => aoAbrirCartao(c.linha)}
                className={cn(
                  "rounded-sm underline underline-offset-2",
                  dashV2.focus,
                )}
              >
                {c.linha.nome}
              </button>{" "}
              ({c.percentual}% sem leitura)
            </span>
          ))}
          .
        </Faixa>
      )}
    </div>
  );
}

export default AlertaDeLeitura;
