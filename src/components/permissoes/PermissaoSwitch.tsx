import { Switch } from "@/components/ui/switch";

interface PermissaoSwitchProps {
  /** Nome da permissão: é o nome acessível da chave. */
  label: string;
  checked: boolean;
  /** Ligada por outra permissão (ou pelo perfil base): aparece ligada, mas não se mexe. */
  implied?: boolean;
  disabled?: boolean;
  /** Só mostra o estado (telas de consulta). */
  readonly?: boolean;
  onChange?: (val: boolean) => void;
}

/** Uma permissão ligada ou desligada. Fica travada quando é implícita, desabilitada ou só de consulta. */
function PermissaoSwitch({
  label,
  checked,
  implied = false,
  disabled,
  readonly,
  onChange,
}: PermissaoSwitchProps) {
  const travada = implied || !!disabled || !!readonly;
  return (
    <Switch
      checked={checked || implied}
      disabled={travada}
      onCheckedChange={(valor) => onChange?.(valor)}
      label={
        <>
          {label}
          {implied && (
            <span className="ml-0.5 text-caption font-normal text-muted-foreground">
              (auto)
            </span>
          )}
        </>
      }
    />
  );
}

export default PermissaoSwitch;
