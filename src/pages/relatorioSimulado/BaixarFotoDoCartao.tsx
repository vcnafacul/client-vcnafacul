import { baixarFotoDoCartao } from "@/services/cartaoResposta/baixarFotoDoCartao";
import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "react-toastify";
import { nomeDaFoto } from "./nomeDaFoto";

/**
 * Baixa a foto do cartão enviado — sem pré-visualizar, só o arquivo.
 *
 * ⚠️ Quem monta só renderiza com `historicoId`: sem ele o estudante não
 * enviou cartão, e o botão só saberia dar 404.
 */
export function BaixarFotoDoCartao({
  token,
  historicoId,
  matricula,
}: {
  token: string;
  historicoId: string;
  matricula: string;
}) {
  const [baixando, setBaixando] = useState(false);

  const baixar = async () => {
    setBaixando(true);
    try {
      const blob = await baixarFotoDoCartao(token, historicoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeDaFoto(matricula, blob.type);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (erro) {
      toast.error((erro as Error).message);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <button
      type="button"
      data-testid="baixar-foto-do-cartao"
      onClick={baixar}
      disabled={baixando}
      className={cn(
        "shrink-0 rounded-md border px-2 py-1 text-xs font-medium disabled:opacity-50",
        dashV2.border,
        dashV2.text.primary,
        dashV2.focus,
      )}
    >
      {baixando ? "Baixando…" : "Baixar cartão"}
    </button>
  );
}
