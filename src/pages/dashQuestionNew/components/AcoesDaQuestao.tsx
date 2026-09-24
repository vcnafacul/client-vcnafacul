import { ExcluirQuestao } from "./ExcluirQuestao";

/**
 * As ações sobre a questão inteira, no rodapé da aba Classificação: excluir
 * (card 33).
 *
 * ⚠️ **Duplicar saiu daqui (QA)** — foi para o topo da aba Linhagem
 * (`DuplicarQuestao`), onde a cópia aparece. O Excluir não precisa mais
 * remontar depois de duplicar: a aba Classificação desmonta quando se vai à
 * Linhagem, e volta perguntando de novo ao servidor.
 */
export function AcoesDaQuestao({
  questaoId,
  aoExcluir,
}: {
  questaoId: string;
  /** Chamado depois de excluir a questão (card 33). */
  aoExcluir?: () => void;
}) {
  return (
    /*
      ⚠️ **Alinhado à DIREITA** — ajuste pedido na revisão do card 25. Ações
      ficam à direita no rodapé; à esquerda o botão lia como se fosse parte da
      classificação acima.

      ⚠️ `border-t` e `pt-3`: no rodapé, sem a linha o bloco encosta na
      classificação e os dois parecem o mesmo assunto.
    */
    <div
      data-acoes-da-questao
      className="flex flex-wrap items-center justify-end gap-3 border-t pt-3 text-xs text-gray-600"
    >
      <ExcluirQuestao questaoId={questaoId} aoExcluir={aoExcluir} />
    </div>
  );
}
