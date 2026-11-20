import { SegmentedControl } from "@/components/ui/segmented-control";
import { FileText, Video } from "lucide-react";

export type TipoDeEnvio = "documento" | "video";

interface Props {
  value: TipoDeEnvio;
  onChange: (tipo: TipoDeEnvio) => void;
}

/** O tipo é escolhido no envio (decisão tickets/049): documento (.docx) ou vídeo (YouTube). */
export function TipoDeEnvioToggle({ value, onChange }: Props) {
  return (
    <SegmentedControl
      aria-label="Tipo de envio"
      fullWidth
      value={value}
      onValueChange={(tipo) => onChange(tipo as TipoDeEnvio)}
      options={[
        { value: "documento", label: "Documento", icon: FileText },
        { value: "video", label: "Vídeo", icon: Video },
      ]}
    />
  );
}
