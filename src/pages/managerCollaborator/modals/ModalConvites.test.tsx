import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalConvites } from "./ModalConvites";
import { textoDaSituacao } from "./textosDosConvites";

const svc = vi.hoisted(() => ({
  listarConvites: vi.fn(),
  criarConvite: vi.fn(),
  reenviarConvite: vi.fn(),
  trocarFuncaoDoConvite: vi.fn(),
  cancelarConvite: vi.fn(),
}));
vi.mock("@/services/prepCourse/conviteColaborador", () => svc);
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

const FUNCOES = [
  { id: "r-prof", name: "Professor" },
  { id: "r-mon", name: "Monitor" },
];
const convite = (over = {}) => ({
  id: "cv1",
  email: "ana@x.com",
  funcao: { id: "r-prof", nome: "Professor" },
  convidadoPor: "Carla Admin",
  situacao: "pendente",
  expiraEm: "2026-10-01T15:00:00Z",
  createdAt: "2026-09-24T12:00:00Z",
  ...over,
});

const montar = () =>
  render(<ModalConvites isOpen handleClose={vi.fn()} funcoes={FUNCOES} />);

describe("ModalConvites (convite 06)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.listarConvites.mockResolvedValue([convite()]);
    for (const f of ["criarConvite", "reenviarConvite", "trocarFuncaoDoConvite", "cancelarConvite"] as const) {
      svc[f].mockResolvedValue({});
    }
  });

  it("lista com a situação calculada", async () => {
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-convite='cv1']")).toBeTruthy(),
    );
    expect(container.querySelector("[data-situacao]")?.textContent).toBe(
      "Pendente — até 01/10",
    );
  });

  it("⚠️ convidar já escolhendo a FUNÇÃO — o pedido do cursinho", async () => {
    const { container } = montar();
    await waitFor(() => expect(svc.listarConvites).toHaveBeenCalled());

    fireEvent.change(container.querySelector("[data-email]")!, {
      target: { value: " nova@x.com " },
    });
    fireEvent.change(container.querySelector("[data-funcao]")!, {
      target: { value: "r-mon" },
    });
    fireEvent.submit(container.querySelector("[data-novo-convite]")!);

    await waitFor(() =>
      expect(svc.criarConvite).toHaveBeenCalledWith("tok", "nova@x.com", "r-mon"),
    );
    // Recarrega a lista em vez de remendar o estado.
    await waitFor(() => expect(svc.listarConvites).toHaveBeenCalledTimes(2));
  });

  it("⚠️ a recusa do servidor aparece com a mensagem dele", async () => {
    svc.criarConvite.mockRejectedValue(
      new Error("Já existe um convite pendente para este email, válido até 01/10."),
    );
    const { container } = montar();
    await waitFor(() => expect(svc.listarConvites).toHaveBeenCalled());

    fireEvent.change(container.querySelector("[data-email]")!, {
      target: { value: "ana@x.com" },
    });
    fireEvent.change(container.querySelector("[data-funcao]")!, {
      target: { value: "r-prof" },
    });
    fireEvent.submit(container.querySelector("[data-novo-convite]")!);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Já existe um convite pendente para este email, válido até 01/10.",
      ),
    );
  });

  it("⚠️ reenviar avisa que o link anterior deixa de valer", async () => {
    const { container } = montar();
    const botao = await waitFor(() => {
      const b = container.querySelector("[data-reenviar='cv1']");
      expect(b).toBeTruthy();
      return b!;
    });

    expect(botao.getAttribute("title")).toMatch(/anterior deixa de valer/);
    fireEvent.click(botao);

    await waitFor(() =>
      expect(svc.reenviarConvite).toHaveBeenCalledWith("tok", "cv1"),
    );
  });

  it("⚠️ cancelar pede confirmação antes", async () => {
    const { container } = montar();
    await waitFor(() =>
      expect(container.querySelector("[data-cancelar='cv1']")).toBeTruthy(),
    );

    fireEvent.click(container.querySelector("[data-cancelar='cv1']")!);
    expect(svc.cancelarConvite).not.toHaveBeenCalled();
    fireEvent.click(container.querySelector("[data-confirmar-cancelar='cv1']")!);

    await waitFor(() =>
      expect(svc.cancelarConvite).toHaveBeenCalledWith("tok", "cv1"),
    );
  });

  it("trocar a função do pendente", async () => {
    const { container } = montar();
    await waitFor(() =>
      expect(container.querySelector("[data-trocar-funcao='cv1']")).toBeTruthy(),
    );

    fireEvent.change(container.querySelector("[data-trocar-funcao='cv1']")!, {
      target: { value: "r-mon" },
    });

    await waitFor(() =>
      expect(svc.trocarFuncaoDoConvite).toHaveBeenCalledWith("tok", "cv1", "r-mon"),
    );
  });

  it("⚠️ convite que não está pendente não tem ações", async () => {
    svc.listarConvites.mockResolvedValue([
      convite({ id: "a", situacao: "aceito" }),
      convite({ id: "b", situacao: "expirado" }),
    ]);
    const { container } = montar();
    await waitFor(() =>
      expect(container.querySelector("[data-convite='a']")).toBeTruthy(),
    );

    expect(container.querySelector("[data-reenviar]")).toBeNull();
    expect(container.querySelector("[data-cancelar]")).toBeNull();
    expect(container.querySelector("[data-trocar-funcao]")).toBeNull();
  });

  it("sem convites: estado vazio", async () => {
    svc.listarConvites.mockResolvedValue([]);
    montar();

    expect(await screen.findByText("Nenhum convite enviado ainda.")).toBeTruthy();
  });
});

describe("textoDaSituacao", () => {
  it("pendente mostra a validade no fuso de São Paulo", () => {
    // 01/10 às 01h UTC ainda é 30/09 em São Paulo.
    expect(
      textoDaSituacao({ situacao: "pendente", expiraEm: "2026-10-01T01:00:00Z" }),
    ).toBe("Pendente — até 30/09");
  });
});
