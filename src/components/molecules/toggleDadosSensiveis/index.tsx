import { FormControlLabel, Switch } from "@mui/material";

interface Props {
  ocultar: boolean;
  onChange: (ocultar: boolean) => void;
  className?: string;
}

export function ToggleDadosSensiveis({ ocultar, onChange, className }: Props) {
  return (
    <FormControlLabel
      className={`mr-0 ${className ?? ""}`}
      control={
        <Switch
          checked={ocultar}
          onChange={(event) => onChange(event.target.checked)}
          size="small"
        />
      }
      label={
        <span className="text-sm text-gray-700">Ocultar dados sensíveis</span>
      }
    />
  );
}
