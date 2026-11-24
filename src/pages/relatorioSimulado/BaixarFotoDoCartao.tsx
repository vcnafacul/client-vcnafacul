import { baixarFotoDoCartao } from "@/services/cartaoResposta/baixarFotoDoCartao";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/toast";
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
  matricula: string | null;
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
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-testid="baixar-foto-do-cartao"
      onClick={baixar}
      disabled={baixando}
      className="shrink-0"
    >
      <Download aria-hidden="true" />
      {baixando ? "Baixando…" : "Baixar cartão"}
    </Button>
  );
}
