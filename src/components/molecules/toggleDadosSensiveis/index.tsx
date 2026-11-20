import { Switch } from "@/components/ui/switch";

interface Props {
  ocultar: boolean;
  onChange: (ocultar: boolean) => void;
  className?: string;
}

export function ToggleDadosSensiveis({ ocultar, onChange, className }: Props) {
  return (
    <div className={className}>
      <Switch
        checked={ocultar}
        onCheckedChange={onChange}
        label="Ocultar dados sensíveis"
      />
    </div>
  );
}
