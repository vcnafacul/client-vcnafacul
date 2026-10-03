import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ getSumindo: vi.fn() }));
vi.mock("@/services/indicadores", async (orig) => ({
  ...(await orig<typeof import("@/services/indicadores")>()),
  ...svc,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: (sel: (s: unknown) => unknown) => sel({ data: { token: "tk" } }),
}));

import { ListaDeSumindo } from "./ListaDeSumindo";

describe("ListaDeSumindo", () => {
  beforeEach(() => svc.getSumindo.mockReset());

  it("só busca quando abre; mostra turma, última presença e o WhatsApp quando vem", async () => {
    svc.getSumindo.mockResolvedValue([
      {
        alunoId: "a1",
        nome: "Ana Souza",
        turma: "Noite",
        ultimaPresenca: "2026-09-28",
        faltasSeguidas: 4,
        telefone: "(11) 98888-7777",
      },
      {
        alunoId: "a2",
        nome: "Bruno Lima",
        turma: "Manhã",
        ultimaPresenca: null,
        faltasSeguidas: 3,
      },
    ]);

    const { rerender } = render(
      <ListaDeSumindo periodoId="p1" aberta={false} aoFechar={() => {}} />,
    );
    expect(svc.getSumindo).not.toHaveBeenCalled();

    rerender(<ListaDeSumindo periodoId="p1" aberta aoFechar={() => {}} />);

    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
    expect(svc.getSumindo).toHaveBeenCalledWith("tk", "p1");
    expect(
      screen.getByText("Noite · última presença em 28/09"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Manhã · não veio a nenhuma aula"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Chamar no WhatsApp/ }),
    ).toHaveAttribute("href", "https://wa.me/5511988887777");
    // sem permissão para o telefone, não há link
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
