import {
  buscarLinhagem,
  type ItemDaLinhagem,
  type LinhagemDaQuestao,
} from "@/services/question/buscarLinhagem";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import {
  rotuloDoStatus,
  TEXTO_SEM_COPIAS,
  TEXTO_SEM_LINHAGEM,
  TEXTO_SEM_VERSOES,
  textoDaPosicao,
  textoDasProvas,
  textoDoAlternador,
} from "./textoDaLinhagem";

type Vista = "versoes" | "copias";

/**
 * A aba Linhagem do modal da questão (card 34A): a cadeia de versões e as
 * cópias, cada uma com o que a identifica, e clicáveis.
 *
 * ⚠️ **Clicar troca a questão do modal** (opção A do card) — quem monta cuida
 * da trilha e do "voltar". Não abre outro modal por cima: seriam duas edições
 * vivas empilhadas, e a de baixo desatualizada quando a de cima versiona.
 *
 * ⚠️ **Busca ao montar, e a aba remonta a cada visita** (o `TabsContent` do
 * Radix desmonta a aba inativa). É o que faz a lista refletir uma duplicação
 * feita agora no rodapé da Classificação, sem canal entre as duas.
 */
export function AbaLinhagem({
  questaoId,
  abrirQuestao,
}: {
  questaoId: string;
  /** Sem ele, a lista aparece sem clique — a informação é o mínimo. */
  abrirQuestao?: (id: string) => void;
}) {
  const {
    data: { token },
  } = useAuthStore();

  const [linhagem, setLinhagem] = useState<LinhagemDaQuestao | null>(null);
  const [erro, setErro] = useState(false);
  const [vista, setVista] = useState<Vista>("versoes");

  useEffect(() => {
    let vivo = true;
    setLinhagem(null);
    setErro(false);
    buscarLinhagem(token, questaoId)
      .then((l) => vivo && setLinhagem(l))
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
    };
  }, [token, questaoId]);

  if (erro) {
    return (
      <p data-linhagem-erro className="p-4 text-sm text-gray-600">
        Não foi possível carregar a linhagem desta questão.
      </p>
    );
  }
  if (!linhagem) {
    return <p className="p-4 text-sm text-gray-500">Carregando…</p>;
  }

  const { versoes, copias, origemCopia } = linhagem;

  /*
    ⚠️ **A aba aparece sempre, mesmo vazia** — aba que some conforme a questão
    faria a barra de abas mudar de largura entre uma questão e outra.
  */
  if (versoes.length === 0 && copias.length === 0 && !origemCopia) {
    return (
      <p data-linhagem-vazia className="p-4 text-sm text-gray-600">
        {TEXTO_SEM_LINHAGEM}
      </p>
    );
  }

  const posicao = versoes.findIndex((v) => v.id === questaoId);

  return (
    <div data-aba-linhagem className="flex flex-col gap-4 p-4">
      <div role="tablist" className="flex gap-2">
        <BotaoDaVista
          ativa={vista === "versoes"}
          onClick={() => setVista("versoes")}
          dado="versoes"
        >
          {textoDoAlternador("Versões", versoes.length)}
        </BotaoDaVista>
        <BotaoDaVista
          ativa={vista === "copias"}
          onClick={() => setVista("copias")}
          dado="copias"
        >
          {textoDoAlternador("Cópias", copias.length)}
        </BotaoDaVista>
      </div>

      {vista === "versoes" &&
        (versoes.length === 0 ? (
          <p className="text-sm text-gray-600">{TEXTO_SEM_VERSOES}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p data-posicao className="text-sm font-semibold text-gray-700">
              {textoDaPosicao(posicao + 1, versoes.length)}
            </p>
            {/*
              ⚠️ **Uma LINHA, da mais antiga à mais nova** — só a última está
              nas provas. Numerar é o que diz isso sem texto a mais.
            */}
            <ol data-lista-versoes className="flex flex-col gap-1">
              {versoes.map((v, i) => (
                <LinhaDaLinhagem
                  key={v.id}
                  item={v}
                  rotulo={`v${i + 1}`}
                  atual={v.id === questaoId}
                  abrirQuestao={abrirQuestao}
                />
              ))}
            </ol>
          </div>
        ))}

      {vista === "copias" && (
        <div className="flex flex-col gap-3">
          {origemCopia && (
            <div data-origem-copia className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-700">
                Esta questão é cópia de
              </p>
              <ul>
                <LinhaDaLinhagem
                  item={origemCopia}
                  abrirQuestao={abrirQuestao}
                />
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-700">
              Cópias desta questão
            </p>
            {copias.length === 0 ? (
              <p className="text-sm text-gray-600">{TEXTO_SEM_COPIAS}</p>
            ) : (
              /*
                ⚠️ **Um leque, não uma árvore.** A cópia de uma cópia aparece na
                aba da cópia — mostrar a árvore inteira é outro card.
              */
              <ul data-lista-copias className="flex flex-col gap-1">
                {copias.map((c) => (
                  <LinhaDaLinhagem
                    key={c.id}
                    item={c}
                    abrirQuestao={abrirQuestao}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BotaoDaVista({
  ativa,
  onClick,
  dado,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  dado: Vista;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      data-vista={dado}
      onClick={onClick}
      className={`rounded-md border px-3 py-1 text-sm ${
        ativa ? "bg-gray-900 text-white" : "bg-white text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Uma questão da linhagem: id curto, começo do enunciado, status, congelada e
 * em quantas provas está.
 *
 * ⚠️ **A atual não é clicável** — abrir a questão que já está aberta só
 * recarregaria o modal.
 */
function LinhaDaLinhagem({
  item,
  rotulo,
  atual = false,
  abrirQuestao,
}: {
  item: ItemDaLinhagem;
  rotulo?: string;
  atual?: boolean;
  abrirQuestao?: (id: string) => void;
}) {
  const clicavel = !atual && !!abrirQuestao;
  const conteudo = (
    <>
      <span className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {rotulo && (
          <span className="font-semibold text-gray-700">{rotulo}</span>
        )}
        <span>{item.id.slice(-6)}</span>
        <span>{rotuloDoStatus(item.status)}</span>
        {item.congelada && <span data-congelada>congelada</span>}
        <span>{textoDasProvas(item.provas)}</span>
        {atual && (
          <span data-atual className="font-semibold text-gray-900">
            · esta
          </span>
        )}
      </span>
      <span className="text-sm text-gray-800">
        {item.enunciado || "(sem enunciado)"}
      </span>
    </>
  );

  return (
    <li
      data-item-linhagem={item.id}
      className={`rounded-md border px-3 py-2 ${atual ? "bg-gray-50" : ""}`}
    >
      {clicavel ? (
        <button
          type="button"
          data-abrir={item.id}
          onClick={() => abrirQuestao?.(item.id)}
          className="flex w-full flex-col items-start gap-1 text-left hover:underline"
        >
          {conteudo}
        </button>
      ) : (
        <div className="flex flex-col gap-1">{conteudo}</div>
      )}
    </li>
  );
}
