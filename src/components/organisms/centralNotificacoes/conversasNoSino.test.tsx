import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";
import { useCentralStore } from "@/store/notificacoes";

const papel = vi.hoisted(() => ({ role: "student" as string | null }));
vi.mock("@/context/ChatProvider", () => ({
  useChatContext: () => ({ role: papel.role, userId: "u1" }),
}));
vi.mock("@/services/notificacoes", () => ({
  listarNotificacoes: vi.fn(async () => ({ data: [], naoLidas: 0 })),
  marcarNotificacaoLida: vi.fn(),
  marcarTodasLidas: vi.fn(),
}));
const navegar = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async (original) => ({
  ...(await original<typeof import("react-router-dom")>()),
  useNavigate: () => navegar,
}));

import { ListaDaCentral, SinoDaCentral } from ".";
import {
  conversasDoEstudanteNoSino,
  conversasDoSuporteNoSino,
} from "./conversasNoSino";

const ts = (ms: number) => ({ toMillis: () => ms });
const conversa = (o: Partial<ConversationDoc> & { id: string }) =>
  ({
    userId: "u1",
    userName: "Ana Souza",
    status: "open",
    unreadCountStudent: 0,
    unreadCountSupport: 0,
    lastMessageAt: ts(Date.now() - 60_000),
    ...o,
  }) as ConversationDoc;

beforeEach(() => {
  vi.clearAllMocks();
  papel.role = "student";
  useAuthStore.setState((s) => ({ data: { ...s.data, token: "jwt" } }));
  useCentralStore.setState({ itens: [], naoLidas: 0, carregada: true });
  useChatStore.getState().resetConversations();
  useChatStore.getState().setInboxDoSuporte([], false);
});

describe("regras das conversas no sino", () => {
  it("estudante: só as com não lidas dele, mais recente primeiro", () => {
    const lista = conversasDoEstudanteNoSino([
      conversa({ id: "lida", partnerPrepId: null }),
      conversa({
        id: "a",
        partnerPrepId: "A",
        cursinhoName: "Alfa",
        unreadCountStudent: 2,
        lastMessageAt: ts(1),
      }),
      conversa({
        id: "p",
        partnerPrepId: null,
        unreadCountStudent: 1,
        lastMessageAt: ts(2),
      }),
    ]);
    expect(lista.map((c) => [c.id, c.titulo, c.naoLidas])).toEqual([
      ["p", "Suporte Você na Facul", 1],
      ["a", "Alfa", 2],
    ]);
  });

  it("suporte: nome do estudante e de onde veio; só as com não lidas do suporte", () => {
    const lista = conversasDoSuporteNoSino([
      conversa({ id: "x", unreadCountSupport: 3, cursinhoName: "Alfa" }),
      conversa({ id: "y", unreadCountStudent: 5 }),
    ]);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({
      titulo: "Ana Souza",
      subtitulo: "Alfa",
      naoLidas: 3,
    });
  });
});

describe("sino com conversas (tickets/031, card 06)", () => {
  it("estudante: bloco Conversas; clique abre o balão na página atual", () => {
    useChatStore
      .getState()
      .setConversations([
        conversa({
          id: "a",
          partnerPrepId: "A",
          cursinhoName: "Alfa",
          unreadCountStudent: 2,
          lastMessageText: "Sua matrícula",
        }),
      ]);
    const onFechar = vi.fn();
    render(
      <MemoryRouter initialEntries={["/dashboard/simulado?aba=2"]}>
        <ListaDaCentral onFechar={onFechar} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Conversas")).toBeInTheDocument();
    expect(screen.getByText(/2 mensagens novas/)).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhuma notificação por aqui."),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Alfa"));
    expect(onFechar).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith({
      pathname: "/dashboard/simulado",
      search: "?aba=2&conversa=a",
    });
  });

  it("colaborador: clique vai para a inbox do cursinho com a conversa", () => {
    papel.role = "support_agent";
    useChatStore
      .getState()
      .setInboxDoSuporte([conversa({ id: "x", unreadCountSupport: 1 })], true);
    render(
      <MemoryRouter>
        <ListaDaCentral onFechar={vi.fn()} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Ana Souza"));
    expect(navegar).toHaveBeenCalledWith(
      "/dashboard/suporte-cursinho?conversa=x",
    );
  });

  it("contador soma notificações não lidas + CONVERSAS com mensagem nova", () => {
    useCentralStore.setState({ naoLidas: 1 });
    useChatStore
      .getState()
      .setConversations([
        conversa({ id: "a", unreadCountStudent: 30 }),
        conversa({ id: "b", unreadCountStudent: 1 }),
      ]);
    render(
      <MemoryRouter>
        <SinoDaCentral />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("button", { name: "Notificações, 3 não lidas" }),
    ).toBeInTheDocument();
  });

  it("sem conversas nem notificações: o aviso de vazio de sempre", () => {
    render(
      <MemoryRouter>
        <ListaDaCentral onFechar={vi.fn()} />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Nenhuma notificação por aqui."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Conversas")).not.toBeInTheDocument();
  });
});
