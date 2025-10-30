/* eslint-disable @typescript-eslint/no-explicit-any */
import { Id, toast } from "react-toastify";

interface UseToastAsyncOptions {
  loadingMessage: string;
  successMessage?: string | ((result: any) => string);
  errorMessage?: string | ((error: any) => string);
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
}

/**
 * Hook para executar ações assíncronas com feedback visual via toast
 *
 * @example
 * const execute = useToastAsync();
 *
 * await execute({
 *   action: async () => await sendEmail(data),
 *   loadingMessage: "Enviando email...",
 *   successMessage: "Email enviado com sucesso!",
 *   errorMessage: "Erro ao enviar email"
 * });
 */
export function useToastAsync() {
  const execute = async <T = any>(
    options: UseToastAsyncOptions & { action: () => Promise<T> }
  ): Promise<T | undefined> => {
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

      const finalSuccessMessage =
        typeof successMessage === "function"
          ? successMessage(result)
          : successMessage || "Operação realizada com sucesso!";

      toast.update(toastId, {
        render: finalSuccessMessage,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      onSuccess?.(result);
      return result;
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
  };

  return execute;
}
