import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";

export type TipoDeEnvio = "documento" | "video";

interface Props {
  value: TipoDeEnvio;
  onChange: (tipo: TipoDeEnvio) => void;
}

/** O tipo é escolhido no envio (decisão tickets/049): documento (.docx) ou vídeo (YouTube). */
export function TipoDeEnvioToggle({ value, onChange }: Props) {
  const botao = (tipo: TipoDeEnvio, rotulo: string, Icone: typeof FileText) => (
    <Button
      type="button"
      variant={value === tipo ? "default" : "outline"}
      aria-pressed={value === tipo}
      onClick={() => onChange(tipo)}
      className="flex-1 gap-2"
    >
      <Icone className="h-4 w-4" /> {rotulo}
    </Button>
  );
  return (
    <div role="group" aria-label="Tipo de envio" className="flex gap-2">
      {botao("documento", "Documento", FileText)}
      {botao("video", "Vídeo", Video)}
    </div>
  );
}
