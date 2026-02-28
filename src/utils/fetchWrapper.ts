/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOGOFF_PATH } from "../routes/path";
import { refreshToken } from "../services/auth/refresh";
import { useAuthStore } from "../store/auth";
import {
  buildFrontendErrorPayload,
  sendFrontendError,
} from "./sendFrontendError";
import { tokenIsExpired } from "./tokenIsExpired";

/** Reporta erro de rede ao backend (requisição falhou antes de chegar ao servidor). */
function reportFetchError(err: unknown, url: string, method: string): void {
  if (url.includes("/frontend-errors")) return;
  const message = err instanceof Error ? err.message : String(err);
  const token = useAuthStore.getState()?.data?.token ?? null;
  const payload = buildFrontendErrorPayload({
    errorType: "FETCH_ERROR",
    message,
    origin: "fetchWrapper",
    request: { method: method || "GET", url },
    errorDetail: err instanceof Error ? err.stack : undefined,
  });
  sendFrontendError(payload, token);
}

// Flag para evitar múltiplas renovações simultâneas
let isRefreshing = false;

// Fila de requisições que falharam durante renovação
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  request: { url: string; options: any };
}> = [];

/**
 * Processa a fila de requisições após renovação
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(async (promise) => {
    if (error) {
      promise.reject(error);
    } else {
      try {
        // Atualiza o token na requisição e tenta novamente
        const updatedOptions = {
          ...promise.request.options,
          headers: {
            ...promise.request.options.headers,
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await fetch(promise.request.url, updatedOptions);
        promise.resolve(response);
      } catch (err) {
        reportFetchError(
          err,
          promise.request.url,
          promise.request.options?.method ?? "GET",
        );
        promise.reject(err);
      }
    }
  });

  failedQueue = [];
};

/**
 * Wrapper para fetch com renovação automática de token
 * Envia cookies automaticamente (refresh token via httpOnly cookie)
 * @param url - URL da requisição
 * @param options - Opções do fetch
 * @returns Promise com Response
 */
const fetchWrapper = async (url: string, options?: any): Promise<Response> => {
  // Evita renovar em endpoints de autenticação
  const isAuthEndpoint =
    url.includes("/login") ||
    url.includes("/refresh") ||
    url.includes("/forgot") ||
    url.includes("/reset");

  // ✅ SEMPRE inclui credentials para enviar/receber cookies
  const fetchOptions = {
    ...options,
    credentials: "include" as RequestCredentials,
  };

  // Verifica se token está expirado antes da requisição
  if (
    !isAuthEndpoint &&
    options?.headers?.Authorization &&
    tokenIsExpired(options?.headers?.Authorization)
  ) {
    // ⚠️ CRITICAL: Se já está renovando, aguarda na fila
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, request: { url, options: fetchOptions } });
      });
    }

    // Inicia processo de renovação
    isRefreshing = true;

    const store = useAuthStore.getState();

    try {
      // ✅ Refresh token vai automaticamente via cookie
      const refreshResponse = await refreshToken();

      // Atualiza store apenas com access_token
      store.doAuth({
        ...store.data,
        token: refreshResponse.access_token,
      });

      // Atualiza o header da requisição atual
      if (fetchOptions?.headers) {
        fetchOptions.headers.Authorization = `Bearer ${refreshResponse.access_token}`;
      }

      // Processa fila de requisições pendentes
      processQueue(null, refreshResponse.access_token);

      isRefreshing = false;
    } catch (error) {
      // Falha ao renovar, redireciona para login
      console.error("❌ Erro ao renovar token:", error);
      isRefreshing = false;
      processQueue(error as Error, null);

      // Limpa store e redireciona
      store.logout();
      window.location.href = LOGOFF_PATH;
      throw error;
    }
  }

  // Faz a requisição (erros de rede são reportados ao back para log/Discord)
  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    reportFetchError(err, url, fetchOptions?.method ?? "GET");
    throw err;
  }

  // Verifica se recebeu 401 (não autorizado)
  if (response.status === 401 && !isAuthEndpoint) {
    // Se já está renovando, adiciona na fila
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, request: { url, options: fetchOptions } });
      });
    }

    isRefreshing = true;

    const store = useAuthStore.getState();

    try {
      // ✅ Refresh token vai automaticamente via cookie
      const refreshResponse = await refreshToken();

      // Atualiza store apenas com access_token
      store.doAuth({
        ...store.data,
        token: refreshResponse.access_token,
      });

      // Processa fila de requisições pendentes
      processQueue(null, refreshResponse.access_token);

      // Repete a requisição original com novo token
      const updatedOptions = {
        ...fetchOptions,
        headers: {
          ...fetchOptions?.headers,
          Authorization: `Bearer ${refreshResponse.access_token}`,
        },
      };

      isRefreshing = false;
      try {
        return await fetch(url, updatedOptions);
      } catch (retryErr) {
        reportFetchError(
          retryErr,
          url,
          updatedOptions?.method ?? fetchOptions?.method ?? "GET",
        );
        throw retryErr;
      }
    } catch (error) {
      // Falha ao renovar token, limpa tudo e redireciona
      console.error("❌ Erro ao renovar token após 401:", error);
      isRefreshing = false;
      processQueue(error as Error, null);

      // Limpa store e redireciona
      store.logout();
      window.location.href = LOGOFF_PATH;

      throw error;
    }
  }

  return response;
};

export default fetchWrapper;
