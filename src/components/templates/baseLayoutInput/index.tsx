import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

export interface BaseLayoutInputPros {
  id: string;
  label: string;
  error?:
    | Merge<
        FieldError,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined)[]
      >
    | undefined;
}

export function BaseLayoutInput({
  id,
  label,
  error,
  children,
}: BaseLayoutInputPros & { children: React.ReactNode }) {
  const errorMessage =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error?.message as any)?.message || error?.message || undefined;
  return (
    <div className="relative mb-4">
      <label
        className="absolute top-1 left-3 text-xs text-grey font-semibold"
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
