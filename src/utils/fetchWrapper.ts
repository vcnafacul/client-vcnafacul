/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOGOFF_PATH } from "../routes/path";
import { refreshToken } from "../services/auth/refresh";
import { useAuthStore } from "../store/auth";
import { decoderUser } from "./decodedUser";
import {
  buildFrontendErrorPayload,
  sendFrontendError,
} from "./sendFrontendError";
import { tokenIsExpired } from "./tokenIsExpired";

/** Retorna true se o erro é um AbortError (request cancelado intencionalmente). */
function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** Reporta erro de rede ao backend (requisição falhou antes de chegar ao servidor). */
function reportFetchError(err: unknown, url: string, method: string): void {
  if (url.includes("/frontend-errors")) return;
  if (isAbortError(err)) return;
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

const RETRY_DELAYS = [500, 1500];

/** Executa fetch com retry automático para GETs que falham por erro de rede. */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();

  // Só faz retry para GET (idempotente)
  if (method !== "GET") {
    return fetch(url, options);
  }

  let lastError: unknown;
  // Tentativa inicial + retries
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      // Não faz retry se foi abort intencional
      if (isAbortError(err)) throw err;
      // Não faz retry se não há mais tentativas
      if (attempt >= RETRY_DELAYS.length) break;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }
  throw lastError;
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
 * Executa o refresh e atualiza o store com as permissões atualizadas do JWT
 */
async function doRefreshAndUpdateStore(): Promise<string> {
  const refreshResponse = await refreshToken();
  const store = useAuthStore.getState();
  store.doAuth(decoderUser(refreshResponse.access_token));
  return refreshResponse.access_token;
}

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

  // SEMPRE inclui credentials para enviar/receber cookies
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
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, request: { url, options: fetchOptions } });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await doRefreshAndUpdateStore();

      if (fetchOptions?.headers) {
        fetchOptions.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      isRefreshing = false;
    } catch (error) {
      console.error("❌ Erro ao renovar token:", error);
      isRefreshing = false;
      processQueue(error as Error, null);

      useAuthStore.getState().logout();
      window.location.href = LOGOFF_PATH;
      throw error;
    }
  }

  // Faz a requisição com retry para GETs
  let response: Response;
  try {
    response = await fetchWithRetry(url, fetchOptions);
  } catch (err) {
    reportFetchError(err, url, fetchOptions?.method ?? "GET");
    throw err;
  }

  // Verifica se recebeu 401 (não autorizado)
  if (response.status === 401 && !isAuthEndpoint) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, request: { url, options: fetchOptions } });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await doRefreshAndUpdateStore();

      processQueue(null, newToken);

      const updatedOptions = {
        ...fetchOptions,
        headers: {
          ...fetchOptions?.headers,
          Authorization: `Bearer ${newToken}`,
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
      console.error("❌ Erro ao renovar token após 401:", error);
      isRefreshing = false;
      processQueue(error as Error, null);

      useAuthStore.getState().logout();
      window.location.href = LOGOFF_PATH;

      throw error;
    }
  }

  return response;
};

export default fetchWrapper;
