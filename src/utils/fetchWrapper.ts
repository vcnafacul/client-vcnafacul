/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOGOFF_PATH } from "../routes/path";
import { refreshToken } from "../services/auth/refresh";
import { useAuthStore } from "../store/auth";
import { tokenIsExpired } from "./tokenIsExpired";

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
        promise.reject(err);
      }
    }
  });

  failedQueue = [];
};

/**
 * Wrapper para fetch com renovação automática de token
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

  // Verifica se token está expirado antes da requisição
  if (
    !isAuthEndpoint &&
    options?.headers?.Authorization &&
    tokenIsExpired(options?.headers?.Authorization)
  ) {
    // ⚠️ CRITICAL: Se já está renovando, aguarda na fila
    if (isRefreshing) {
      console.log("⏳ Requisição aguardando renovação em andamento...");
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, request: { url, options } });
      });
    }

    // Inicia processo de renovação
    isRefreshing = true;
    console.log("🔄 Iniciando renovação de token (pré-requisição)...");

    const store = useAuthStore.getState();
    const refreshTokenValue = store.data.refresh_token;

    if (!refreshTokenValue) {
      // Sem refresh token, redireciona para login
      isRefreshing = false;
      processQueue(new Error("Sem refresh token"), null);
      window.location.href = LOGOFF_PATH;
      throw new Error("Sessão expirada");
    }

    try {
      console.log(
        "📤 Enviando refresh_token:",
        refreshTokenValue.substring(0, 8) + "..."
      );
      const refreshResponse = await refreshToken(refreshTokenValue);
      console.log("✅ Token renovado com sucesso!");

      // Atualiza store com novos tokens
      store.doAuth({
        ...store.data,
        token: refreshResponse.access_token,
        refresh_token: refreshResponse.refresh_token,
      });

      // Atualiza o header da requisição atual
      if (options?.headers) {
        options.headers.Authorization = `Bearer ${refreshResponse.access_token}`;
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

  // Faz a requisição
  const response = await fetch(url, options);

  // Verifica se recebeu 401 (não autorizado)
  if (response.status === 401 && !isAuthEndpoint) {
    console.log("⚠️ Recebido 401 - Token inválido");

    // Se já está renovando, adiciona na fila
    if (isRefreshing) {
      console.log("⏳ Requisição 401 aguardando renovação em andamento...");
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, request: { url, options } });
      });
    }

    isRefreshing = true;
    console.log("🔄 Iniciando renovação de token (pós-401)...");

    const store = useAuthStore.getState();
    const refreshTokenValue = store.data.refresh_token;

    if (!refreshTokenValue) {
      // Sem refresh token, redireciona para login
      console.log("❌ Sem refresh token disponível");
      isRefreshing = false;
      processQueue(new Error("Sem refresh token"), null);
      window.location.href = LOGOFF_PATH;
      return response;
    }

    try {
      console.log(
        "📤 Enviando refresh_token:",
        refreshTokenValue.substring(0, 8) + "..."
      );
      const refreshResponse = await refreshToken(refreshTokenValue);
      console.log("✅ Token renovado com sucesso após 401!");

      // Atualiza store com novos tokens
      store.doAuth({
        ...store.data,
        token: refreshResponse.access_token,
        refresh_token: refreshResponse.refresh_token,
      });

      // Processa fila de requisições pendentes
      processQueue(null, refreshResponse.access_token);

      // Repete a requisição original com novo token
      const updatedOptions = {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${refreshResponse.access_token}`,
        },
      };

      isRefreshing = false;
      return fetch(url, updatedOptions);
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
