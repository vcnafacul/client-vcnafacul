import { dashV2 } from "@/components/dashV2";
import type { ResumoDoRelatorio as Resumo } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import type { Distribuicao, FaixaDoHistograma } from "./distribuicao";
import { HistogramaDaTurma } from "./HistogramaDaTurma";

/** Um bloco rotulado do resumo — "Resultado" ou "Cobertura". */
function Bloco({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-[14rem] flex-col gap-1">
      <span
        className={cn(
          "text-[0.65rem] font-semibold uppercase tracking-wide",
          dashV2.text.muted,
        )}
      >
        {rotulo}
      </span>
      {children}
    </div>
  );
}

const TRACO = "—";

function pct(fracao: number | null): string {
  return fracao === null ? TRACO : `${Math.round(fracao * 100)}%`;
}

/**
 * ⚠️ **Dois blocos rotulados, e não três números soltos com o mesmo peso**
 * (card 09 / `UX.md` §3.1).
 *
 * Dois dos três números antigos eram sobre o PROCESSO (quantos cartões
 * chegaram, quantos leram) e um sobre o RESULTADO. Com o mesmo `text-2xl`, o
 * olho não separava — e a pergunta que trouxe a pessoa até ali ficava com um
 * terço da atenção.
 *
 * `Resultado` responde "como foi"; `Cobertura` responde "dá para confiar
 * nisso" — e é ali que `comLeituraConcluida` finalmente faz sentido, como o
 * denominador da média que ele sempre foi.
 *
 * ⚠️ **As duas contagens continuam aparecendo sempre.** Sem elas ninguém
 * entende a diferença entre "30 alunos" e "27 no cálculo", e a média parece
 * errada.
 */
export function ResumoDoRelatorio({
  resumo,
  distribuicao,
  faixas = [],
  cartoesNoRecorte,
}: {
  resumo: Resumo;
  /** ⚠️ Ausente = a tela ainda não calculou; tudo `null` = base insuficiente. */
  distribuicao?: Distribuicao;
  faixas?: FaixaDoHistograma[];
  /**
   * Quantos estudantes DESTE recorte enviaram cartão — o numerador do rodapé
   * de turma (card 15).
   *
   * ⚠️ **Ausente = o recorte é o cursinho inteiro**, e aí o rodapé não aparece:
   * o numerador seria igual ao denominador e a frase não informaria nada.
   *
   * ⚠️ **Não é `totalNoRecorte`.** Aquele conta ESTUDANTES do recorte, incluindo
   * quem não enviou; este conta CARTÕES, que é a unidade do outro lado da
   * comparação (`totalEstudantesComCartaoNoCursinho`). Comparar os dois diria
   * "30 dos 27", que é a frase errada com números certos.
   */
  cartoesNoRecorte?: number;
}) {
  const d = distribuicao;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-8">
        <Bloco rotulo="Resultado">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={cn("text-2xl font-semibold", dashV2.text.primary)}>
              {/* ⚠️ `null` vira travessão. "0%" afirmaria que a turma zerou. */}
              {pct(resumo.aproveitamentoGeral)}
            </span>
            <span className={cn("text-xs", dashV2.text.muted)}>média</span>
            {/*
              ⚠️ **Mediana e faixa ao lado da média, não no lugar dela.** Média
              sozinha esconde a turma bimodal — que é o caso comum em cursinho:
              todo mundo entre 54% e 62% e metade em 35% com metade em 80% dão a
              MESMA média e pedem aulas opostas.

              ⚠️ Em ACERTOS, não em percentual: é a unidade em que o cursinho
              conversa e em que se compara com nota de corte.
            */}
            {d !== undefined && d.mediana !== null && (
              <span
                data-testid="resumo-distribuicao"
                className={cn("text-xs", dashV2.text.secondary)}
              >
                mediana {d.mediana} · metade do meio entre {d.q1} e {d.q3} ·
                faixa {d.minimo}–{d.maximo}
              </span>
            )}
          </div>
          <HistogramaDaTurma faixas={faixas} base={d?.base ?? 0} />
        </Bloco>

        <Bloco rotulo="Cobertura">
          <div className={cn("text-2xl font-semibold", dashV2.text.primary)}>
            {resumo.comLeituraConcluida} de {resumo.totalNoRecorte}
          </div>
          {/*
            ⚠️ "No cálculo da média", e **não** "Com leitura concluída": a api
            conta aqui só as linhas que são `completed` E trazem nota numérica,
            enquanto o badge da tabela diz "Lido" pelo `status` sozinho. Uma
            linha concluída sem nota aparece como "Lido" e fica de fora desta
            contagem — com o rótulo antigo, 28 badges em cima de um "27".
          */}
          <div className={cn("text-xs", dashV2.text.muted)}>
            estudantes no cálculo da média
          </div>
        </Bloco>
      </div>

      {/*
        ⚠️ Escrito na tela, não só no código. Um relatório que silenciosamente
        ignora quem respondeu online gera "cadê o fulano?" na primeira semana.
      */}
      <p className={cn("text-xs", dashV2.text.muted)}>
        Este relatório considera apenas quem respondeu por cartão-resposta. Quem
        resolveu o simulado pela plataforma não aparece aqui.
      </p>

      {/*
        ⚠️ **O rodapé que o campo esperava desde sempre** (card 15). Sem ele,
        quem abre o relatório de uma turma não sabe se está vendo um pedaço ou o
        todo — e o número já viajava do ms até aqui sem nunca ser mostrado.

        ⚠️ Só no recorte de turma: no cursinho inteiro os dois lados são o mesmo
        número.

        ⚠️ **O denominador conta o cursinho INTEIRO, inclusive cartão de quem já
        saiu** — é `countDocuments` no ms, que não sabe de matrícula ativa. Com
        um ex-aluno na conta a frase pode dizer "27 de 30" onde o 30 inclui
        alguém que não aparece em lista nenhuma. O aviso de
        `linhasSemEstudanteAtivo` logo abaixo é o que explica a diferença; somar
        as duas coisas numa frase só as tornaria ilegíveis.
      */}
      {cartoesNoRecorte !== undefined &&
        resumo.totalEstudantesComCartaoNoCursinho > 0 && (
          <p data-cartoes-do-cursinho className={cn("text-xs", dashV2.text.muted)}>
            {cartoesNoRecorte} dos {resumo.totalEstudantesComCartaoNoCursinho}{" "}
            cartões deste simulado no cursinho são desta turma.
          </p>
        )}

      {/*
        ⚠️ Contado, NUNCA listado: o nome de quem saiu do cursinho não é
        informação que este relatório deva expor. Sem a nota, os totais não
        batem e a leitura natural é "o sistema perdeu cartão".
      */}
      {resumo.linhasSemEstudanteAtivo > 0 && (
        <p className={cn("text-xs", dashV2.text.muted)}>
          {resumo.linhasSemEstudanteAtivo} cartão(ões) enviado(s) por estudantes
          que não estão mais ativos nesta turma ou cursinho não aparecem na
          lista.
        </p>
      )}
    </section>
  );
}
