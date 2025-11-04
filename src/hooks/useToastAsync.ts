/* eslint-disable @typescript-eslint/no-explicit-any */
import { Id, toast } from "react-toastify";

// Tipo base para opções comuns
interface BaseToastAsyncOptions {
  loadingMessage: string;
  errorMessage?: string | ((error: any) => string);
  onError?: (error: any) => void;
  onFinally?: () => void;
}

// Opções para action sem retorno (void)
interface VoidToastAsyncOptions extends BaseToastAsyncOptions {
  action: () => Promise<void>;
  successMessage?: string;
  onSuccess?: () => void;
}

// Opções para function com retorno
interface FunctionToastAsyncOptions<T> extends BaseToastAsyncOptions {
  action: () => Promise<T>;
  successMessage?: string | ((result: T) => string);
  onSuccess?: (result: T) => void;
}

// Union type para as opções
type UseToastAsyncOptions<T = any> =
  | VoidToastAsyncOptions
  | FunctionToastAsyncOptions<T>;

/**
 * Hook para executar ações assíncronas com feedback visual via toast
 *
 * Suporta dois tipos de ações:
 * 1. Action sem retorno (void): onSuccess não recebe parâmetros
 * 2. Function com retorno: onSuccess recebe o resultado
 *
 * @example
 * // Action sem retorno
 * const execute = useToastAsync();
 * await execute({
 *   action: async () => await deleteItem(id),
 *   loadingMessage: "Excluindo...",
 *   successMessage: "Item excluído!",
 *   onSuccess: () => console.log("Done!")
 * });
 *
 * @example
 * // Function com retorno
 * await execute({
 *   action: async () => await fetchData(),
 *   loadingMessage: "Carregando...",
 *   successMessage: (data) => `${data.length} itens carregados`,
 *   onSuccess: (data) => setData(data)
 * });
 */
export function useToastAsync() {
  // Overload para action void
  async function execute(options: VoidToastAsyncOptions): Promise<void>;

  // Overload para function com retorno
  async function execute<T>(
    options: FunctionToastAsyncOptions<T>
  ): Promise<T | undefined>;

  // Implementação
  async function execute<T = any>(
    options: UseToastAsyncOptions<T>
  ): Promise<T | undefined> {
    const {
      action,
      loadingMessage,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      onFinally,
    } = options;

    const toastId: Id = toast.loading(loadingMessage);

    try {
      const result = await action();

      // Determinar mensagem de sucesso
      const finalSuccessMessage =
        typeof successMessage === "function"
          ? successMessage(result as T)
          : successMessage || "Operação realizada com sucesso!";

      toast.update(toastId, {
        render: finalSuccessMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Chamar onSuccess com ou sem parâmetro dependendo do tipo
      if (onSuccess) {
        if (result === undefined) {
          // Action void
          (onSuccess as () => void)();
        } else {
          // Function com retorno
          (onSuccess as (result: T) => void)(result as T);
        }
      }

      return result as T | undefined;
    } catch (error: any) {
      const finalErrorMessage =
        typeof errorMessage === "function"
          ? errorMessage(error)
          : errorMessage || error.message || "Erro ao realizar operação";

      toast.update(toastId, {
        render: finalErrorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });

      onError?.(error);
      return undefined;
    } finally {
      onFinally?.();
    }
  }

  return execute;
}
