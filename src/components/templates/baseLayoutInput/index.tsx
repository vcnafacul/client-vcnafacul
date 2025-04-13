import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

export interface BaseLayoutInputPros {
  id: string;
  label: string | React.ReactNode;
  error?:
    | Merge<
        FieldError,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined)[]
      >
    | undefined;
  isCheckbox?: boolean;
  rows?: number;
}

export function BaseLayoutInput({
  id,
  label,
  error,
  children,
  isCheckbox = false,
}: BaseLayoutInputPros & { children: React.ReactNode }) {
  const errorMessage =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error?.message as any)?.message || error?.message || undefined;
  return (
    <div className={`relative mb-4 w-full ${isCheckbox ? "flex items-center pt-8 pl-2" : ""}`}>
        <label
          className="absolute p-0 top-1.5 left-2 text-xs text-grey font-semibold"
          htmlFor={id}
        >
          {label}
        </label>
        {children}
      {error && (
        <span className="absolute text-xs text-red">{errorMessage}</span>
      )}
    </div>
  );
}
