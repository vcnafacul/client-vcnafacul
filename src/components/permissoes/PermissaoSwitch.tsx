import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PermissionType } from "@/dtos/roles/permissionHierarchy";

interface PermissaoSwitchProps {
  /** Nome da permissão: é o nome acessível da chave. */
  label: string;
  checked: boolean;
  /** Ligada por outra permissão (ou pelo perfil base): aparece ligada, mas não se mexe. */
  implied?: boolean;
  disabled?: boolean;
  /** Só mostra o estado (telas de consulta): linha estática, sem chave. */
  readonly?: boolean;
  onChange?: (val: boolean) => void;
  /** Tipo da permissão, mostrado como texto quando `mostrarTipo`. */
  type?: PermissionType;
  /** Liga o selo "Cursinho"/"Projeto": onde os dois tipos aparecem juntos. */
  mostrarTipo?: boolean;
}

const NOME_DO_TIPO: Record<PermissionType, string> = {
  [PermissionType.prepCourse]: "Cursinho",
  [PermissionType.project]: "Projeto",
};

/**
 * Uma permissão. Editável, implícita ou desabilitada usa o `Switch`.
 * Só de consulta (R37) é uma linha estática em contraste total: ícone + nome + estado em texto.
 */
function PermissaoSwitch({
  label,
  checked,
  implied = false,
  disabled,
  readonly,
  onChange,
  type,
  mostrarTipo,
}: PermissaoSwitchProps) {
  const selo =
    mostrarTipo && type ? (
      <Badge variant="outline">{NOME_DO_TIPO[type]}</Badge>
    ) : null;

  if (readonly) {
    const ligada = checked || implied;
    return (
      <div className="flex min-h-6 items-center gap-2 text-body text-foreground">
        {ligada ? (
          <Check aria-hidden="true" className="size-4 shrink-0" />
        ) : (
          <Minus aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className={ligada ? "" : "text-muted-foreground"}>{label}</span>
        <span className="sr-only">{ligada ? "concedida" : "não concedida"}</span>
        {selo}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked || implied}
        disabled={implied || !!disabled}
        onCheckedChange={(valor) => onChange?.(valor)}
        label={
          <>
            {label}
            {implied && (
              <span className="text-caption font-normal text-muted-foreground">
                {" (auto)"}
              </span>
            )}
          </>
        }
      />
      {selo}
    </div>
  );
}

export default PermissaoSwitch;
