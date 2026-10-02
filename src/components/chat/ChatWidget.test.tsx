import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));
const servicos = vi.hoisted(() => ({
  markRead: vi.fn(async () => undefined),
  openConversation: vi.fn(),
}));
vi.mock("@/services/chat/markRead", () => ({ markRead: servicos.markRead }));
vi.mock("@/services/chat/openConversation", () => ({
  openConversation: servicos.openConversation,
  CooldownError: class extends Error {},
}));
vi.mock("@/context/ChatProvider", () => ({
  useChatContext: () => ({ role: "student", userId: "u1" }),
}));
// O chat em si (mensagens/Firestore) não interessa aqui.
vi.mock("./ChatLayout", () => ({
  ChatLayout: (p: { title: string; onBack?: () => void }) => (
    <div data-testid="chat">
      <span>chat: {p.title}</span>
      {p.onBack && <button onClick={p.onBack}>Voltar</button>}
    </div>
  ),
}));

import { ChatWidget } from "./ChatWidget";

const ts = (ms: number) => ({ toMillis: () => ms });
const conversa = (o: Partial<ConversationDoc> & { id: string }) =>
  ({
    userId: "u1",
    userName: "Ana",
    status: "open",
    unreadCountStudent: 0,
    unreadCountSupport: 0,
    lastMessageAt: ts(Date.now()),
    ...o,
  }) as ConversationDoc;

const PROJETO = conversa({ id: "p", partnerPrepId: null, lastMessageText: "Olá" });
const CURSINHO = conversa({
  id: "a",
  partnerPrepId: "A",
  cursinhoName: "Cursinho Alfa",
  unreadCountStudent: 2,
  lastMessageSenderType: "support",
  lastMessageText: "Sua matrícula",
});

function montar(conversas: ConversationDoc[], endereco = "/dashboard") {
  useChatStore.getState().resetConversations();
  useChatStore.getState().setOpen(false);
  useChatStore.getState().setConversations(conversas);
  return render(
    <MemoryRouter initialEntries={[endereco]}>
      <ChatWidget />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Celular: o painel é um Sheet (o Popover do desktop é lento no jsdom).
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as never;
  useAuthStore.setState((s) => ({ data: { ...s.data, token: "jwt" } }));
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue();
});

describe("ChatWidget — conversas do estudante (tickets/031, card 04)", () => {
  it("uma conversa: abre direto nela, sem lista", () => {
    montar([PROJETO]);
    fireEvent.click(screen.getByRole("button", { name: "Precisa de ajuda?" }));
    expect(screen.getByText("chat: Suporte Você na Facul")).toBeInTheDocument();
    expect(screen.queryByText("Suas conversas")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Voltar" })).not.toBeInTheDocument();
  });

  it("duas: lista primeiro; tocar abre a certa e voltar retorna", () => {
    montar([CURSINHO, PROJETO]);
    fireEvent.click(
      screen.getByRole("button", { name: "Mensagem do suporte pendente" }),
    );
    expect(screen.getByText("Suas conversas")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cursinho Alfa"));
    expect(screen.getByText("chat: Cursinho Alfa")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("Suas conversas")).toBeInTheDocument();
  });

  it("não lida do suporte em QUALQUER conversa → botão em 'Mensagem do Suporte' com a soma", () => {
    montar([PROJETO, CURSINHO]);
    const botao = screen.getByRole("button", {
      name: "Mensagem do suporte pendente",
    });
    expect(botao).toHaveTextContent("Mensagem do Suporte");
    expect(botao).toHaveTextContent("2");
  });

  it("marca como lida só a conversa que está na tela", () => {
    montar([CURSINHO, PROJETO]);
    fireEvent.click(
      screen.getByRole("button", { name: "Mensagem do suporte pendente" }),
    );
    expect(servicos.markRead).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Cursinho Alfa"));
    expect(servicos.markRead).toHaveBeenCalledWith("jwt", "a");
  });

  it("a única encerrada: mostra a lista, que tem 'Nova conversa'", () => {
    montar([conversa({ id: "x", status: "closed", closedAt: ts(Date.now() - 60 * 60_000) })]);
    fireEvent.click(screen.getByRole("button", { name: "Precisa de ajuda?" }));
    expect(screen.getByText("Encerrada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nova conversa/ })).toBeEnabled();
  });

  it("nova conversa: a api devolve o id (existente ou novo) e abre nele", async () => {
    servicos.openConversation.mockResolvedValue({ id: "a" });
    montar([CURSINHO, PROJETO]);
    fireEvent.click(
      screen.getByRole("button", { name: "Mensagem do suporte pendente" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Nova conversa/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Abrir conversa|Confirmar|Iniciar/i }));
    });
    expect(servicos.openConversation).toHaveBeenCalledTimes(1);
    expect(screen.getByText("chat: Cursinho Alfa")).toBeInTheDocument();
  });

  it("?conversa=<id dele> → abre o balão já na conversa (card 05)", () => {
    montar([CURSINHO, PROJETO], "/dashboard?conversa=a");
    expect(screen.getByText("chat: Cursinho Alfa")).toBeInTheDocument();
    expect(useChatStore.getState().isOpen).toBe(true);
  });

  it("?conversa=<id de outro> → não abre; aviso", () => {
    montar([CURSINHO, PROJETO], "/dashboard?conversa=de-outro");
    expect(useChatStore.getState().isOpen).toBe(false);
    expect(toast.info).toHaveBeenCalledWith("Conversa não encontrada.");
  });
});
