import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import {
  listarCopias,
  type CopiaDaQuestao,
} from "@/services/question/listarCopias";
import { duplicarQuestao } from "@/services/question/duplicarQuestao";
import { useCallback, useEffect, useState } from "react";
import {
  TEXTO_DUPLICAR,
  textoDeCopias,
  TEXTO_VER_ORIGINAL,
  TITULO_DUPLICAR,
} from "./textoDaLinhagem";

/**
 * O lastro da questão: de onde ela veio, quem nasceu dela, e o botão de
 * duplicar (card 25).
 *
 * ⚠️ **Duplicar é botão à PARTE, fora do fluxo de edição** — e isso é decisão do
 * card 27. Duplicar não nasce de estar editando: nasce de "quero outra questão
 * baseada nesta", e a pessoa nem abriu o editor.
 *
 * ⚠️ **O que separa duplicar de versionar, na cabeça de quem usa, é o que
 * acontece com a PROVA** — e por isso o texto do botão diz isso. Duplicar não
 * mexe em prova nenhuma: a cópia nasce órfã.
 */
export function LinhagemDaQuestao({
  questaoId,
  origem,
  aoDuplicar,
  abrirQuestao,
}: {
  questaoId: string;
  /** ⚠️ Ausente na esmagadora maioria — só cópias têm. */
  origem?: string | null;
  /** Chamado depois de duplicar, com o id da nova. */
  aoDuplicar?: (novaId: string) => void;
  /** Abre outra questão no mesmo modal — para "ver original" e "ver cópias". */
  abrirQuestao?: (id: string) => void;
}) {
  const {
    data: { token, permissao },
  } = useAuthStore();

  const [copias, setCopias] = useState<CopiaDaQuestao[]>([]);
  const [abertas, setAbertas] = useState(false);
  const [duplicando, setDuplicando] = useState(false);

  /*
    ⚠️ **Falha em silêncio**, e de propósito: a linhagem é acessória ao modal.
    Um erro aqui não pode derrubar a questão nem disputar atenção com o
    "tentar de novo" do conteúdo.

    ⚠️ **E o `catch` NÃO limpa a lista** — isto foi corrigido por uma mutação
    que sobreviveu. Com `setCopias([])`, um recarregamento que falhasse (o de
    depois de duplicar) apagaria as cópias já conhecidas e a tela diria
    "nenhuma cópia" sobre uma questão que tem. Manter o último valor bom é o
    comportamento certo, e agora há teste.
  */
  const carregar = useCallback(() => {
    listarCopias(token, questaoId)
      .then(setCopias)
      .catch(() => undefined);
  }, [token, questaoId]);

  useEffect(carregar, [carregar]);

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
      carregar();
      aoDuplicar?.(nova._id);
    } finally {
      setDuplicando(false);
    }
  };

  const rotulo = textoDeCopias(copias.length);

  return (
    /*
      ⚠️ **Alinhado à DIREITA** — ajuste pedido na revisão. O botão de duplicar
      é ação sobre a questão inteira, e ações ficam à direita no rodapé; à
      esquerda ele lia como se fosse parte da classificação acima.

      ⚠️ `border-t` e `pt-3`: no rodapé, sem a linha o bloco encosta na
      classificação e os dois parecem o mesmo assunto.
    */
    <div
      data-linhagem
      className="flex flex-wrap items-center justify-end gap-3 border-t pt-3 text-xs text-gray-600"
    >
      {/*
        ⚠️ `mr-auto` empurra o badge para a ESQUERDA enquanto o resto fica à
        direita: "de onde esta questão veio" é informação, e informação não
        compete com o botão de ação pelo mesmo canto.
      */}
      {origem && (
        <span data-badge-copia className="mr-auto flex items-center gap-1">
          {/*
            ⚠️ **Só o id, e não o enunciado da original.** Buscar a questão de
            origem para mostrar o texto dobraria a carga do modal por uma
            informação que o link já alcança em um clique.
          */}
          Cópia de {origem.slice(-6)}
          {abrirQuestao && (
            <button
              type="button"
              data-ver-original
              onClick={() => abrirQuestao(origem)}
              className="underline underline-offset-2"
            >
              {TEXTO_VER_ORIGINAL}
            </button>
          )}
        </span>
      )}

      {rotulo !== null && (
        <button
          type="button"
          data-ver-copias
          onClick={() => setAbertas((v) => !v)}
          aria-expanded={abertas}
          className="underline underline-offset-2"
        >
          {abertas ? "▾ " : "▸ "}
          {rotulo}
        </button>
      )}

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

      {abertas && copias.length > 0 && (
        <ul data-lista-copias className="w-full flex flex-col gap-0.5 pl-2">
          {copias.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <span>{c.id.slice(-6)}</span>
              <span className="text-gray-400">{c.status}</span>
              {abrirQuestao && (
                <button
                  type="button"
                  data-abrir-copia={c.id}
                  onClick={() => abrirQuestao(c.id)}
                  className="underline underline-offset-2"
                >
                  abrir
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
