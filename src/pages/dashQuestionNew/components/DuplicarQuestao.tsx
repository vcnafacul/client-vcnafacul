import { Roles } from "@/enums/roles/roles";
import { duplicarQuestao } from "@/services/question/duplicarQuestao";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { TEXTO_DUPLICAR, TITULO_DUPLICAR } from "./textoDaLinhagem";

/**
 * O botão de duplicar a questão (card 25), no topo da aba Linhagem.
 *
 * ⚠️ **Mudou de lugar (QA):** ficava no rodapé da Classificação, longe de onde
 * a cópia aparece. Na Linhagem, quem duplica vê a cópia nascer na lista.
 *
 * ⚠️ **Duplicar é botão à PARTE, fora do fluxo de edição** — decisão do card
 * 27. Duplicar não nasce de estar editando: nasce de "quero outra questão
 * baseada nesta", e a pessoa nem abriu o editor.
 */
export function DuplicarQuestao({
  questaoId,
  aoDuplicar,
}: {
  questaoId: string;
  /** Chamado depois de duplicar, com o id da nova. */
  aoDuplicar?: (novaId: string) => void;
}) {
  const {
    data: { token, permissao },
  } = useAuthStore();
  const [duplicando, setDuplicando] = useState(false);

  /*
    ⚠️ **`criarQuestao`, e não `validarQuestao`.** Duplicar produz questão nova:
    quem pode criar pode duplicar. Mesmo critério que a api aplica na guarda —
    um botão que só sabe receber 403 é pior que botão nenhum.
  */
  if (!permissao[Roles.criarQuestao]) return null;

  const duplicar = async () => {
    setDuplicando(true);
    try {
      const nova = await duplicarQuestao(token, questaoId);
      aoDuplicar?.(nova._id);
    } finally {
      setDuplicando(false);
    }
  };

  return (
    <button
      type="button"
      data-duplicar
      disabled={duplicando}
      onClick={duplicar}
      className="rounded-md border px-2 py-1 text-xs text-gray-600 disabled:opacity-50"
      title={TITULO_DUPLICAR}
    >
      {duplicando ? "Duplicando…" : TEXTO_DUPLICAR}
    </button>
  );
}
