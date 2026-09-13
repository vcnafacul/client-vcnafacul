import type { StatusV2 } from "@/components/dashV2/tokens";
import { SimuladoResumo } from "../../../dtos/prova/prova";
import { formatDateTime } from "../../../utils/date";
import { getStatus, isSemJanela } from "../../../utils/simuladoAvailability";

/**
 * O status do simulado traduzido para o que a tela desenha.
 *
 * ⚠️ **Função pura, em arquivo próprio, e isso não é cerimônia.** O status
 * virou um ícone sozinho: sem texto na tela, a frase que este módulo devolve é
 * a *única* coisa que explica o ícone — ela vai no tooltip **e** no `sr-only`.
 * Testar isso renderizando Radix custaria caro (o `DashToolbar.test.tsx` leva
 * ~38s por causa disso e está fora do CI); testando a função, a regra inteira
 * fica coberta em milissegundos.
 *
 * ⚠️ **A forma do ícone é o portador do significado, não a cor.** Ver o bloco
 * `icon` em `dashV2.status` (`tokens.ts`): nenhum laranja da paleta alcança
 * 3:1 sobre branco, então "antes da janela" sai em cinza e quem o distingue de
 * "bloqueado" é o relógio contra o cadeado.
 */
export type FormaDoIcone = "cadeado" | "relogio" | "expirado" | "check";

export interface StatusVisual {
  forma: FormaDoIcone;
  tone: StatusV2;
  /**
   * Frase completa e autossuficiente. **Sem ela o ícone não significa nada** —
   * é o texto do tooltip e o texto que o leitor de tela anuncia.
   */
  descricao: string;
}

/**
 * ⚠️ Esta frase carrega a informação que as colunas "Disponível de" e
 * "Disponível até" mostravam antes de serem removidas. Se ela encolher para
 * "Disponível"/"Expirado", a janela some da tela e só existe dentro do modal
 * de edição — que foi exatamente o risco que o redesenho precisou evitar.
 */
function descreveJanela(
  simulado: Pick<SimuladoResumo, "disponivelDe" | "disponivelAte">,
): string {
  const de = formatDateTime(simulado.disponivelDe);
  const ate = formatDateTime(simulado.disponivelAte);
  if (de && ate) return `Disponível de ${de} até ${ate}`;
  if (ate) return `Disponível até ${ate}`;
  return `Disponível desde ${de}`;
}

export function statusVisual(
  simulado: Pick<
    SimuladoResumo,
    "bloqueado" | "disponivelDe" | "disponivelAte"
  >,
  agora: Date = new Date(),
): StatusVisual {
  switch (getStatus(simulado, agora)) {
    case "bloqueado":
      return {
        forma: "cadeado",
        tone: "neutral",
        descricao:
          "Aprovação pendente — o simulado precisa de todas as questões cadastradas, aprovadas e numeradas",
      };

    case "antes_da_janela": {
      const ate = formatDateTime(simulado.disponivelAte);
      const abre = `Abre em ${formatDateTime(simulado.disponivelDe)}`;
      return {
        forma: "relogio",
        tone: "running",
        descricao: ate ? `${abre} e fecha em ${ate}` : abre,
      };
    }

    case "depois_da_janela":
      return {
        forma: "expirado",
        tone: "missing",
        descricao: `Expirou em ${formatDateTime(simulado.disponivelAte)}`,
      };

    default:
      // ⚠️ Os dois casos abaixo são ambos "o estudante consegue responder". O
      // que muda é administrativo, e por isso saem no mesmo check com tons
      // diferentes — verde quando há prazo, cinza quando não há.
      return isSemJanela(simulado)
        ? {
            forma: "check",
            tone: "neutral",
            descricao: "Disponível — sem janela definida",
          }
        : {
            forma: "check",
            tone: "done",
            descricao: descreveJanela(simulado),
          };
  }
}

export interface ProporcaoQuestoes {
  /** `null` quando a categoria não declara o total — aí não há barra a desenhar. */
  pct: number | null;
  texto: string;
  completo: boolean;
}

/**
 * Quantas questões o simulado já tem, contra o que a categoria espera.
 *
 * ⚠️ **`total` pode não existir.** A categoria é opcional no `SimuladoResumo`,
 * e uma divisão por `undefined` produz `NaN` — que vira `width: NaN%` e uma
 * barra que o navegador ignora em silêncio. Por isso o retorno é `null`
 * explícito, e a tela decide não desenhar nada.
 */
export function proporcaoQuestoes(
  quantidade: number,
  total: number | null | undefined,
): ProporcaoQuestoes {
  if (!total || total <= 0) {
    return { pct: null, texto: `${quantidade}/—`, completo: false };
  }
  return {
    // ⚠️ Limitado a 100: um simulado com mais questões que o esperado é
    // possível, e a barra não pode vazar da trilha.
    pct: Math.min(100, (quantidade / total) * 100),
    texto: `${quantidade}/${total}`,
    completo: quantidade >= total,
  };
}
