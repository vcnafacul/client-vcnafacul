import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { duplicarQuestao } from "@/services/question/duplicarQuestao";
import { useState } from "react";
import { ExcluirQuestao } from "./ExcluirQuestao";
import { TEXTO_DUPLICAR, TITULO_DUPLICAR } from "./textoDaLinhagem";

/**
 * As ações sobre a questão inteira, no rodapé da aba Classificação: duplicar
 * (card 25) e excluir (card 33).
 *
 * ⚠️ **A linhagem saiu daqui** (card 34A): o badge de origem e a lista de
 * cópias foram para a aba Linhagem, que mostra a cadeia inteira. O botão de
 * duplicar FICOU — é ação sobre a questão, não parte da linhagem.
 *
 * ⚠️ **Duplicar é botão à PARTE, fora do fluxo de edição** — decisão do card
 * 27. Duplicar não nasce de estar editando: nasce de "quero outra questão
 * baseada nesta", e a pessoa nem abriu o editor.
 */
export function AcoesDaQuestao({
  questaoId,
  aoDuplicar,
  aoExcluir,
}: {
  questaoId: string;
  /** Chamado depois de duplicar, com o id da nova. */
  aoDuplicar?: (novaId: string) => void;
  /** Chamado depois de excluir a questão (card 33). */
  aoExcluir?: () => void;
}) {
  const {
    data: { token, permissao },
  } = useAuthStore();

  const [duplicando, setDuplicando] = useState(false);
  /*
    ⚠️ **Quantas vezes duplicou nesta tela** — é a `key` do Excluir. Duplicar
    torna esta questão origem de alguém, e origem não se exclui: remontar faz o
    botão perguntar de novo ao servidor em vez de continuar visível.
  */
  const [duplicacoes, setDuplicacoes] = useState(0);

  /*
    ⚠️ **`criarQuestao`, e não `validarQuestao`.** Duplicar produz questão nova:
    quem pode criar pode duplicar. Mesmo critério que a api aplica na guarda —
    um botão que só sabe receber 403 é pior que botão nenhum.
  */
  const podeDuplicar = !!permissao[Roles.criarQuestao];

  const duplicar = async () => {
    setDuplicando(true);
    try {
      const nova = await duplicarQuestao(token, questaoId);
      setDuplicacoes((n) => n + 1);
      aoDuplicar?.(nova._id);
    } finally {
      setDuplicando(false);
    }
  };

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
      <ExcluirQuestao
        key={duplicacoes}
        questaoId={questaoId}
        aoExcluir={aoExcluir}
      />

      {podeDuplicar && (
        <button
          type="button"
          data-duplicar
          disabled={duplicando}
          onClick={duplicar}
          className="rounded-md border px-2 py-1 disabled:opacity-50"
          title={TITULO_DUPLICAR}
        >
          {duplicando ? "Duplicando…" : TEXTO_DUPLICAR}
        </button>
      )}
    </div>
  );
}
