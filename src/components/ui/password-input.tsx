import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "./button"
import { Input, type InputProps } from "./input"

export interface PasswordInputProps
  extends Omit<InputProps, "type" | "trailing"> {
  /** Começa com a senha à mostra. */
  initiallyVisible?: boolean
}

/**
 * `Input` de senha com o botão de mostrar/ocultar no fim do campo (ícone
 * `ghost` com `aria-label`). Vai dentro de um `Field`, que injeta `id` e `aria-*`.
 * O `autoComplete` é de quem usa: `current-password` no login, `new-password` ao criar.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ initiallyVisible = false, ...props }, ref) => {
    const [visible, setVisible] = React.useState(initiallyVisible)
    return (
      <Input
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        trailing={
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visible}
            className="h-7 w-7 sm:h-7 sm:w-7"
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
        }
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
