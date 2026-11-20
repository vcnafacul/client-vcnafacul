import { Button } from "@mui/material";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { AlertaEvasaoModal } from "./alertaEvasaoModal";

/** Botão + modal do alerta de risco de evasão (tickets/054, card 03). */
export function BotaoAlertaEvasao({ fullWidth }: { fullWidth?: boolean }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<TriangleAlert size="1em" />}
        onClick={() => setAberto(true)}
        fullWidth={fullWidth}
      >
        Alerta de evasão
      </Button>
      {aberto && (
        <AlertaEvasaoModal isOpen handleClose={() => setAberto(false)} />
      )}
    </>
  );
}
