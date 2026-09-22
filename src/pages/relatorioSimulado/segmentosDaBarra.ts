import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * A lógica pura da barra de distribuição.
 *
 * ⚠️ **Separada do componente de propósito**, no mesmo padrão de
 * `percentuais.ts`, `statusDaLinha.ts` e `dificuldadeDaQuestao.ts`: montar DOM
 * no jsdom custa caro neste projeto, e fração de segmento é justamente o que
 * não precisa de DOM para ser verificado. Sem a separação o
 * `react-refresh/only-export-components` também reclama, e com razão.
 */
export const ALTERNATIVAS = ["A", "B", "C", "D", "E"] as const;

/** Rótulo do segmento de quem não foi lido. Não é uma alternativa. */
export const SEM_LEITURA = "·";

/**
 * As cores da barra.
 *
 * ⚠️ **Três cores, não seis.** A identificação de qual segmento é qual vem da
 * ORDEM (fixa, A–E) e do `title`, nunca da cor: seis cores distinguíveis não
 * existem nesta paleta, e inventá-las seria exatamente a deriva que o
 * `tokens.ts` do dashV2 combate. Distratores são todos o mesmo cinza — o que
 * importa neles é o tamanho relativo, e tamanho se compara sem cor.
 *
 * ⚠️ `green3` mede 3.77:1 e **não** carrega significado sozinho — o gabarito
 * ganha borda e a letra junto (ver `BarraDeDistribuicao`).
 */
export const CORES_DA_BARRA = {
  /** O gabarito. */
  gabarito: "bg-green3",
  /** Qualquer distrator. */
  distrator: "bg-gray2",
  /** Quem não foi lido — mais claro, porque não é uma escolha de ninguém. */
  semLeitura: "bg-lightGray",
} as const;

export interface SegmentoDaBarra {
  rotulo: string;
  /** De 0 a 1, sobre `respondentes`. */
  fracao: number;
  contagem: number;
  gabarito: boolean;
}

/**
 * Os seis segmentos da distribuição de uma questão.
 *
 * ⚠️ **Ordem fixa A–E, e não por tamanho.** O mockout do `UX.md` sugeria ordenar
 * pelo maior, mas isso daria a cada linha uma ordem diferente — e o objetivo
 * declarado desta coluna é ser lida de CIMA A BAIXO, para achar o distrator que
 * pegou a turma. Ordem instável derrota justamente o uso.
 *
 * ⚠️ **Denominador `respondentes`**, o mesmo de `percentuais.ts`, e é o que faz
 * os seis somarem 100% — pela primeira vez na tela. Hoje as cinco colunas somam
 * menos que isso porque `semLeitura` não entra em `porAlternativa`, e a
 * explicação vive num comentário no código, não na interface.
 *
 * ⚠️ **Lista vazia sem respondentes**, e não seis zeros: uma barra de 0% se lê
 * como "ninguém marcou nada", e o que houve foi não haver base para dividir.
 */
export function segmentosDaBarra(q: QuestaoDoRelatorio): SegmentoDaBarra[] {
  if (q.respondentes <= 0) return [];

  const segmento = (rotulo: string, contagem: number): SegmentoDaBarra => ({
    rotulo,
    contagem,
    fracao: contagem / q.respondentes,
    gabarito: rotulo === q.alternativaCorreta,
  });

  return [
    ...ALTERNATIVAS.map((alt) => segmento(alt, q.porAlternativa[alt] ?? 0)),
    // ⚠️ `gabarito: false` sempre — "não lido" nunca é a resposta certa, mesmo
    // que `alternativaCorreta` viesse com o valor deste rótulo por acidente.
    { ...segmento(SEM_LEITURA, q.semLeitura), gabarito: false },
  ];
}
