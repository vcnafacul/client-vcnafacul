import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/auth";
import { useCentralStore } from "@/store/notificacoes";
import type { NotificacaoDaCentral } from "@/services/notificacoes";

const api = vi.hoisted(() => ({
  listarNotificacoes: vi.fn(),
  marcarNotificacaoLida: vi.fn(),
  marcarTodasLidas: vi.fn(),
}));
vi.mock("@/services/notificacoes", () => api);
const navegar = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async (original) => ({
  ...(await original<typeof import("react-router-dom")>()),
  useNavigate: () => navegar,
}));

import { ListaDaCentral, SinoDaCentral, rotuloDoContador } from ".";

const n = (over: Partial<NotificacaoDaCentral> = {}): NotificacaoDaCentral => ({
  id: "n1",
  titulo: "Simulado liberado",
  corpo: "O simulado de sábado já está no ar.",
  url: "/simulados",
  lidaEm: null,
  createdAt: new Date().toISOString(),
  ...over,
});

const comItens = (itens: NotificacaoDaCentral[]) =>
  useCentralStore.setState({
    itens,
    naoLidas: itens.filter((i) => !i.lidaEm).length,
    carregada: true,
  });

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState((s) => ({ data: { ...s.data, token: "jwt" } }));
  api.marcarNotificacaoLida.mockResolvedValue(undefined);
  api.marcarTodasLidas.mockResolvedValue(undefined);
  api.listarNotificacoes.mockResolvedValue({
    data: [],
    naoLidas: 0,
    page: 1,
    limit: 20,
    totalItems: 0,
  });
});

const lista = (onFechar = vi.fn()) =>
  render(
    <MemoryRouter>
      <ListaDaCentral onFechar={onFechar} />
    </MemoryRouter>,
  );

describe("rotuloDoContador", () => {
  it("some no zero; 9+ acima de 9", () => {
    expect(rotuloDoContador(0)).toBeNull();
    expect(rotuloDoContador(3)).toBe("3");
    expect(rotuloDoContador(10)).toBe("9+");
  });
});

describe("ListaDaCentral", () => {
  it("vazia: mensagem, sem 'marcar todas'", () => {
    comItens([]);
    lista();
    expect(
      screen.getByText("Nenhuma notificação por aqui."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /marcar todas/i })).toBeNull();
  });

  it("clicar marca como lida, fecha e navega", async () => {
    comItens([n()]);
    const onFechar = vi.fn();
    lista(onFechar);

    fireEvent.click(screen.getByRole("button", { name: /Simulado liberado/ }));

    expect(api.marcarNotificacaoLida).toHaveBeenCalledWith("n1", "jwt");
    expect(useCentralStore.getState().naoLidas).toBe(0);
    expect(onFechar).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith("/simulados");
  });

  it("⚠️ link de fora não navega (mesma barreira do push)", () => {
    comItens([n({ url: "https://golpe.example" })]);
    lista();
    fireEvent.click(screen.getByRole("button", { name: /Simulado liberado/ }));
    expect(api.marcarNotificacaoLida).toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });

  it("marcar todas zera o contador", async () => {
    comItens([
      n(),
      n({ id: "n2", titulo: "Outra" }),
      n({ id: "n3", lidaEm: "x" }),
    ]);
    lista();
    fireEvent.click(screen.getByRole("button", { name: /marcar todas/i }));
    expect(api.marcarTodasLidas).toHaveBeenCalledWith("jwt");
    expect(useCentralStore.getState().naoLidas).toBe(0);
    expect(
      useCentralStore.getState().itens.find((i) => i.id === "n3")!.lidaEm,
    ).toBe("x");
  });

  it("api falhou ao marcar → recarrega a verdade", async () => {
    comItens([n()]);
    api.marcarNotificacaoLida.mockRejectedValue(new Error("fora"));
    api.listarNotificacoes.mockResolvedValue({
      data: [n()],
      naoLidas: 1,
      page: 1,
      limit: 20,
      totalItems: 1,
    });
    lista();
    fireEvent.click(screen.getByRole("button", { name: /Simulado liberado/ }));
    await waitFor(() => expect(useCentralStore.getState().naoLidas).toBe(1));
  });
});

describe("SinoDaCentral", () => {
  it("logado: carrega e mostra o contador; deslogado: some", async () => {
    api.listarNotificacoes.mockResolvedValue({
      data: [n(), n({ id: "n2" })],
      naoLidas: 2,
      page: 1,
      limit: 20,
      totalItems: 2,
    });
    const { unmount } = render(
      <MemoryRouter>
        <SinoDaCentral />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("button", { name: "Notificações, 2 não lidas" }),
    ).toHaveTextContent("2");
    unmount();

    useAuthStore.setState((s) => ({ data: { ...s.data, token: "" } }));
    const { container } = render(
      <MemoryRouter>
        <SinoDaCentral />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
