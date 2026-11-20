import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";

/**
 * `Input` de senha com o botão de mostrar/ocultar no fim do campo (ícone `ghost`
 * com `aria-label`). Vai dentro de um `Field`, que injeta `id` e `aria-*`.
 * tickets/059/01
 */
export const SenhaInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type" | "trailing"> & { visivelAoIniciar?: boolean }
>(({ visivelAoIniciar = false, autoComplete = "current-password", ...props }, ref) => {
  const [visivel, setVisivel] = React.useState(visivelAoIniciar);
  return (
    <Input
      ref={ref}
      autoComplete={autoComplete}
      {...props}
      type={visivel ? "text" : "password"}
      trailing={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          className="h-7 w-7 sm:h-7 sm:w-7"
          onClick={() => setVisivel((v) => !v)}
        >
          {visivel ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      }
    />
  );
});
SenhaInput.displayName = "SenhaInput";
