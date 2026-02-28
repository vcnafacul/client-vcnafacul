/**
 * Envia erros do frontend para o backend (log Grafana + Discord se grave).
 * Usado quando a requisição falha antes de chegar ao back (ex: "Failed to fetch").
 * Nunca envia token, senha ou dados sensíveis.
 */

import { frontendErrors } from "@/services/urls";

const APP_VERSION =
  typeof import.meta.env.VITE_APP_VERSION === "string"
    ? import.meta.env.VITE_APP_VERSION
    : "0.0.0";

export type FrontendErrorPayload = {
  errorType: string;
  message: string;
  page?: string;
  origin?: string;
  request?: { method: string; url: string };
  user?: { id: string };
  metadata?: {
    userAgent?: string;
    online?: boolean;
    release?: string;
  };
  errorDetail?: string;
};

/**
 * Monta o payload permitido (whitelist). Não incluir token, Authorization ou dados sensíveis.
 */
export function buildFrontendErrorPayload(
  opts: {
    errorType: string;
    message: string;
    origin?: string;
    request?: { method: string; url: string };
    userId?: string | null;
    errorDetail?: string;
  },
): FrontendErrorPayload {
  const payload: FrontendErrorPayload = {
    errorType: opts.errorType,
    message: opts.message,
    page: typeof window !== "undefined" ? window.location.pathname : undefined,
    origin: opts.origin,
    request: opts.request,
    metadata: {
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
      release: APP_VERSION,
    },
  };
  if (opts.userId) payload.user = { id: opts.userId };
  if (opts.errorDetail) payload.errorDetail = opts.errorDetail;
  return payload;
}

/**
 * Envia o erro para o backend (sendBeacon quando possível para não bloquear).
 * Se token for passado, usa fetch com Authorization para o back identificar o usuário (nunca envia token no body).
 * Falha silenciosa para não impactar o usuário.
 */
export function sendFrontendError(
  payload: FrontendErrorPayload,
  token?: string | null,
): void {
  const url = frontendErrors;

  try {
    if (token?.trim() && typeof fetch !== "undefined") {
      fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        keepalive: true,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(url, blob);
    } else if (typeof fetch !== "undefined") {
      fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Evitar que o envio do log quebre o fluxo
  }
}
