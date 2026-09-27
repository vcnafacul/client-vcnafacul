import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PushStatus } from "@/services/push/push";

const hook = vi.hoisted(() => ({
  status: "default" as PushStatus | null,
  aparelhos: [] as unknown[],
  ocupado: false,
  ativar: vi.fn(),
  desativar: vi.fn(),
  testar: vi.fn(),
}));
vi.mock("@/hooks/usePushNotifications", () => ({
  usePushNotifications: () => hook,
}));
const toast = vi.hoisted(() => ({
  success: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast }));

import { NotificacoesDoAparelho } from "./NotificacoesDoAparelho";
import { TEXTOS } from "./textosDoStatus";

const comStatus = (status: PushStatus | null, aparelhos: unknown[] = []) => {
  hook.status = status;
  hook.aparelhos = aparelhos;
  return render(<NotificacoesDoAparelho />);
};
const botao = (nome: RegExp) => screen.queryByRole("button", { name: nome });

beforeEach(() => vi.clearAllMocks());

describe("NotificacoesDoAparelho", () => {
  it("push desligado no ambiente (ou carregando) → não renderiza nada", () => {
    expect(comStatus("disabled-by-flag").container).toBeEmptyDOMElement();
    expect(comStatus(null).container).toBeEmptyDOMElement();
  });

  it.each(Object.keys(TEXTOS) as (keyof typeof TEXTOS)[])(
    "%s mostra o título certo",
    (status) => {
      comStatus(status);
      expect(
        screen.getByRole("heading", { name: TEXTOS[status].titulo }),
      ).toBeInTheDocument();
    },
  );

  it("⚠️ default: o pedido de permissão só sai no clique de Ativar", () => {
    comStatus("default");
    expect(hook.ativar).not.toHaveBeenCalled();

    fireEvent.click(botao(/ativar notificações/i)!);

    expect(hook.ativar).toHaveBeenCalledTimes(1);
  });

  it("desativado aqui (granted-not-registered) também oferece Ativar", () => {
    comStatus("granted-not-registered");
    expect(botao(/ativar notificações/i)).toBeInTheDocument();
  });

  it("denied: sem botão de ativar, com o passo a passo para desbloquear", () => {
    comStatus("denied");
    expect(botao(/ativar/i)).toBeNull();
    expect(
      screen.getByText(/Permissões → Notificações → Permitir/),
    ).toBeInTheDocument();
  });

  it("ios-needs-install: passo a passo de Adicionar à Tela de Início", () => {
    comStatus("ios-needs-install");
    expect(screen.getByText("Adicionar à Tela de Início")).toBeInTheDocument();
    expect(botao(/ativar/i)).toBeNull();
  });

  it.each(["ios-too-old", "unsupported"] as const)(
    "%s: só o aviso, sem ação",
    (status) => {
      comStatus(status);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    },
  );

  it("active: enviar teste e desativar; conta os aparelhos quando há mais de um", () => {
    comStatus("active", [{}, {}]);
    expect(screen.getByText("Ativas em 2 aparelhos.")).toBeInTheDocument();

    fireEvent.click(botao(/desativar/i)!);
    expect(hook.desativar).toHaveBeenCalledTimes(1);
  });

  it("enviar teste: sucesso e falha de entrega viram avisos diferentes", async () => {
    hook.testar.mockResolvedValueOnce({ successCount: 1, failureCount: 0 });
    comStatus("active");
    fireEvent.click(botao(/enviar notificação de teste/i)!);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());

    hook.testar.mockResolvedValueOnce({ successCount: 0, failureCount: 1 });
    fireEvent.click(botao(/enviar notificação de teste/i)!);
    await waitFor(() => expect(toast.warn).toHaveBeenCalled());
  });
});
