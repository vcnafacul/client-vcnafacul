import { TEXTO_VOLTAR } from "./textoDaLinhagem";

/**
 * A trilha no topo do modal (card 34A): por onde a pessoa veio navegando a
 * linhagem, e o "voltar".
 *
 * ⚠️ **Só aparece com mais de uma questão na pilha** — abrir uma questão pelo
 * card da listagem não tem de onde voltar.
 */
export function TrilhaDaLinhagem({
  trilha,
  abrir,
  voltar,
}: {
  trilha: string[];
  abrir: (id: string) => void;
  voltar: () => void;
}) {
  if (trilha.length <= 1) return null;

  return (
    <nav
      data-trilha
      aria-label="Trilha da linhagem"
      className="flex flex-wrap items-center gap-1 text-xs text-gray-600"
    >
      {trilha.map((id, i) => {
        const ultima = i === trilha.length - 1;
        return (
          <span key={id} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>›</span>}
            {ultima ? (
              <span aria-current="page" className="font-semibold text-gray-900">
                Questão {id.slice(-6)}
              </span>
            ) : (
              <button
                type="button"
                data-trilha-item={id}
                onClick={() => abrir(id)}
                className="underline underline-offset-2"
              >
                Questão {id.slice(-6)}
              </button>
            )}
          </span>
        );
      })}
      <button
        type="button"
        data-voltar
        onClick={voltar}
        className="ml-2 rounded-md border px-2 py-0.5"
      >
        {TEXTO_VOLTAR}
      </button>
    </nav>
  );
}
