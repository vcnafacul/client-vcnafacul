import type { OpcaoDoCampo } from "./select-opcoes";

export type { OpcaoDoCampo };
/** Nome antigo da opção, dos formulários guiados por dados (`formData`). */
export type FormFieldOption = OpcaoDoCampo;

/** Descrição de um campo dos formulários guiados por dados (login, geo, nova prova…). */
export interface FormFieldInput {
  id: string;
  label: string;
  type?:
    | "text"
    | "password"
    | "number"
    | "option"
    | "textarea"
    | "date"
    | "email"
    | "select";
  visibility?: boolean;
  disabled?: boolean;
  /** `*` vermelho no rótulo e `required` no campo. */
  required?: boolean;
  value?: string | number | readonly string[] | undefined;
  defaultValue?: string | number | readonly string[] | undefined;
  options?: OpcaoDoCampo[];
  className?: string;
}
