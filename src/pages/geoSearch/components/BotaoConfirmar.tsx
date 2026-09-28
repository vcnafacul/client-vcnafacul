import { ThumbsUp } from "lucide-react";

type Props = {
  confirmado: boolean;
  contagem: number;
  ocupado: boolean;
  onClick: () => void;
};

/**
 * "Informação correta" (card 09). Texto de ajuda por `title`/`aria-label`,
 * e não pelo Tooltip do Radix: aqui são dezenas de botões, e ele é lento.
 */
export function BotaoConfirmar({
  confirmado,
  contagem,
  ocupado,
  onClick,
}: Props) {
  const ajuda = confirmado
    ? "Você confirmou — clique para desfazer"
    : "Confirmo que as informações estão corretas";
  return (
    <button
      type="button"
      aria-pressed={confirmado}
      aria-label={ajuda}
      title={ajuda}
      disabled={ocupado}
      onClick={(e) => {
        // O card inteiro é clicável (voa até o cursinho): o botão não pode.
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm transition disabled:opacity-60 ${
        confirmado
          ? "bg-green-100 text-green-700"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <ThumbsUp
        aria-hidden
        className={`h-4 w-4 ${confirmado ? "fill-current" : ""}`}
      />
      {/* Com 0, só o ícone. */}
      {contagem > 0 && <span>{contagem}</span>}
    </button>
  );
}
