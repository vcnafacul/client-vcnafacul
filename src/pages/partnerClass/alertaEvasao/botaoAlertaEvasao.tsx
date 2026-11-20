import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { AlertaEvasaoModal } from "./alertaEvasaoModal";

/** Botão + modal do alerta de risco de evasão (tickets/054, card 03). */
export function BotaoAlertaEvasao({ fullWidth }: { fullWidth?: boolean }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setAberto(true)}
        className={fullWidth ? "w-full" : undefined}
      >
        <TriangleAlert aria-hidden="true" />
        Alerta de evasão
      </Button>
      {aberto && (
        <AlertaEvasaoModal isOpen handleClose={() => setAberto(false)} />
      )}
    </>
  );
}
