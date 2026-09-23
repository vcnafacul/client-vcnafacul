import { dashV2 } from "@/components/dashV2";
import type { ResumoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { SEM_NOME } from "@/pages/partnerClassWithStudents/SimuladosDaTurma";

/**
 * Formata a data do último cartão. `null` some da linha em vez de virar "—".
 *
 * ⚠️ Só a data, sem hora: a hora sugere uma precisão que o dado não tem — ele é
 * "quando a linha mais recente foi criada", e reenvio não a move.
 */
function formatarData(iso: string | null): string | null {
  if (iso === null) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Quem é este relatório: simulado, recorte e tamanho da prova.
 *
 * O cabeçalho era a string fixa "Relatório do simulado", e o payload não trazia
 * nome nenhum. Três situações rotineiras em que isso custa:
 *
 * - **link colado no WhatsApp da coordenação** — a rota existe justamente para
 *   ser compartilhada, e quem recebe abre uma página que não se identifica;
 * - **folha impressa** — todos os controles são `print:hidden`, o que está
 *   certo; o resultado era uma tabela de nomes e notas sem dizer de que prova é,
 *   e duas impressões em cima da mesa ficam indistinguíveis;
 * - **`?turma=`** — o recorte muda todos os números, e a única pista de que ele
 *   está ativo era a coluna `Turma` **desaparecer**: um sinal por ausência.
 *
 * ⚠️ **NÃO é `print:hidden`.** É a única parte do cabeçalho que precisa sair na
 * folha — o `Voltar` continua escondido.
 */
/**
 * ⚠️ "evolução", e não "desempenho" (card 17). O rótulo da aba é "Desempenho",
 * mas quem está no relatório já está vendo desempenho — o que falta é a
 * travessia entre aplicações, e o texto tem de dizer o que a pessoa ganha ao
 * clicar, não para onde o link aponta.
 */
export const TEXTO_VER_DESEMPENHO = "Ver evolução da turma";

export function IdentificacaoDoRelatorio({
  resumo,
  comTitulo,
  linkDoDesempenho,
}: {
  resumo: ResumoDoRelatorio;
  /**
   * `true` na rota (o `<h1>` é o nome do simulado); `false` na aba da turma,
   * onde o seletor logo acima já mostra o nome e a turma é a tela inteira.
   */
  comTitulo: boolean;
  /**
   * O link para a evolução da turma — a aba "Desempenho" (card 17).
   *
   * ⚠️ **As duas telas não se conheciam**, e são as duas metades da mesma
   * pergunta: este relatório responde "como foi NESTE simulado", e o desempenho
   * responde "a turma melhorou". Quem olha um quase sempre quer o outro, e não
   * havia caminho entre eles.
   *
   * ⚠️ **Ausente = não há para onde ir**, e aí nada é desenhado: o relatório do
   * cursinho inteiro não tem turma, e quem não pode abrir a turma não deve ver
   * um link que só sabe redirecionar calado. Nunca um link desabilitado — ele
   * ocuparia o cabeçalho para dizer que não faz nada.
   *
   * ⚠️ **Dois modos, e os dois existem:** da rota própria do relatório é
   * navegação de verdade (`href`, para abrir em aba nova funcionar); de dentro
   * da tela de turma é só trocar de aba (`aoClicar`) — um `<a>` ali
   * recarregaria a página inteira para chegar onde já se está.
   */
  linkDoDesempenho?: { href?: string; aoClicar?: () => void };
}) {
  /*
    ⚠️ **`simuladoNome: null` significa duas coisas diferentes**, e confundi-las
    faz a tela mentir:

    1. o simulado foi apagado depois do vínculo — os cartões existem, e a
       constante `SEM_NOME` é a resposta certa (a mesma do seletor da aba);
    2. o recorte de turma está VAZIO — a api nem perguntou ao ms. Aqui dizer
       "Simulado removido" afirmaria que o simulado sumiu, quando o que está
       vazio é a turma.

    `totalNoRecorte` separa os dois.
  */
  const recorteVazio = resumo.totalNoRecorte === 0;
  const nome = resumo.simuladoNome ?? (recorteVazio ? null : SEM_NOME);

  const contexto = [
    resumo.turmaNome,
    resumo.totalDeQuestoes > 0 ? `${resumo.totalDeQuestoes} questões` : null,
    // ⚠️ "último cartão", e não "data da prova" nem "última atividade" — ver o
    // docblock do campo no DTO.
    formatarData(resumo.ultimoCartaoEm) &&
      `último cartão em ${formatarData(resumo.ultimoCartaoEm)}`,
  ].filter(Boolean);

  const temLink =
    linkDoDesempenho !== undefined &&
    (linkDoDesempenho.href !== undefined ||
      linkDoDesempenho.aoClicar !== undefined);

  if (nome === null && contexto.length === 0 && !temLink) return null;

  const classeDoLink = cn(
    "rounded-sm text-xs underline underline-offset-2 print:hidden",
    dashV2.text.secondary,
    dashV2.focus,
  );

  return (
    <div data-testid="identificacao-do-relatorio" className="flex flex-col gap-1">
      {comTitulo && nome !== null && (
        <h1 className={cn("text-xl font-semibold", dashV2.text.primary)}>
          {nome}
        </h1>
      )}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {contexto.length > 0 && (
          <p className={cn("text-xs", dashV2.text.muted)}>
            {contexto.join(" · ")}
          </p>
        )}
        {/* ⚠️ `print:hidden`: numa folha impressa um link não é acionável. */}
        {temLink &&
          (linkDoDesempenho.href !== undefined ? (
            <a
              data-link-desempenho
              href={linkDoDesempenho.href}
              className={classeDoLink}
            >
              {TEXTO_VER_DESEMPENHO}
            </a>
          ) : (
            <button
              type="button"
              data-link-desempenho
              onClick={linkDoDesempenho.aoClicar}
              className={classeDoLink}
            >
              {TEXTO_VER_DESEMPENHO}
            </button>
          ))}
      </div>
    </div>
  );
}
