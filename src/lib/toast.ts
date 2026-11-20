import { isValidElement } from "react";
import { toast as base } from "react-toastify";
import type { ToastOptions } from "react-toastify";

// Mesma API do toast do react-toastify; só o `autoClose` por tipo muda (tickets/059 §3):
// sucesso e info somem em 5 s; aviso e erro ficam até a pessoa fechar. Opção explícita vence.
export type {
  Id,
  ToastContent,
  ToastOptions,
  ToastPosition,
  UpdateOptions,
} from "react-toastify";

type Tipo = "success" | "info" | "warning" | "warn" | "error";

const AUTO_CLOSE: Record<Tipo, number | false> = {
  success: 5000,
  info: 5000,
  warning: false,
  warn: false,
  error: false,
};

type Base = typeof base;

function comPadrao<T extends Tipo>(tipo: T): Base[T] {
  // Chama `base[tipo]` na hora, não na criação: quem troca o método (testes) continua valendo.
  return ((content: Parameters<Base[T]>[0], options?: ToastOptions) =>
    base[tipo](content, { autoClose: AUTO_CLOSE[tipo], ...options })) as Base[T];
}

const toast = ((content, options) => base(content, options)) as Base;

for (const chave of Object.keys(base) as (keyof Base)[]) {
  const valor = base[chave];
  // Função delega na hora da chamada: quem troca o método do original continua valendo.
  (toast as unknown as Record<string, unknown>)[chave] =
    typeof valor === "function"
      ? (...args: unknown[]) => (base[chave] as (...a: unknown[]) => unknown)(...args)
      : valor;
}
for (const tipo of Object.keys(AUTO_CLOSE) as Tipo[]) {
  toast[tipo] = comPadrao(tipo);
}

// `toast.promise`: sucesso fecha em 5 s e erro fica na tela, igual aos outros métodos.
// Texto, nó ou função viram `{ render, autoClose }`; objeto sem `autoClose` ganha o padrão.
function normalizar(valor: unknown, autoClose: number | false): unknown {
  if (valor === undefined || valor === null) return valor;
  const ehObjeto =
    typeof valor === "object" && !isValidElement(valor) && !Array.isArray(valor);
  if (ehObjeto) return { autoClose, ...(valor as object) };
  return { render: valor, autoClose };
}

toast.promise = ((promessa: unknown, mensagens: Record<string, unknown>, options?: unknown) =>
  (base.promise as (...a: unknown[]) => unknown)(
    promessa,
    {
      ...mensagens,
      success: normalizar(mensagens?.success, AUTO_CLOSE.success),
      error: normalizar(mensagens?.error, AUTO_CLOSE.error),
    },
    options,
  )) as Base["promise"];

export { toast };
