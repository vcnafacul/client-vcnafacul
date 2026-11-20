import type { SelectOption } from "@/components/ui/options-select";

/**
 * Um campo dos formulários guiados por dados (login, esqueci a senha, cadastro
 * de cursinho, nova prova). O dado declara tudo: `type`, `inputMode` e
 * `autoComplete` não são deduzidos do `id`.
 */
export interface FormFieldInput {
  id: string;
  label: string;
  type?: "text" | "password" | "number" | "textarea" | "date" | "email" | "select";
  /** Teclado do celular (CEP e telefone numéricos, e-mail). */
  inputMode?: "text" | "numeric" | "tel" | "email" | "url" | "decimal";
  /** Token do HTML (`email`, `tel`, `postal-code`, `new-password`…). */
  autoComplete?: string;
  /** Senha: começa à mostra. */
  visibility?: boolean;
  disabled?: boolean;
  /** `*` vermelho no rótulo e `required` no campo. */
  required?: boolean;
  value?: string | number | readonly string[] | undefined;
  defaultValue?: string | number | readonly string[] | undefined;
  options?: SelectOption[];
  className?: string;
}
