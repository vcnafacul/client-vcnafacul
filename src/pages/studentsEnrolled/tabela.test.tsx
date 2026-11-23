import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StatusApplication } from "@/enums/prepCourse/statusApplication";

const getStudentsEnrolled = vi.fn();
const auth = vi.hoisted(() => ({ permissao: { gerenciarEstudantes: true } as Record<string, boolean> }));

// Desktop: aqui a tabela, e não a lista do celular, é o que está sob teste.
vi.mock("@/hooks/use-above-sm", () => ({
  SM_QUERY: "(min-width: 768px)",
  useAboveSm: () => true,
}));
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({ useAcimaDeSm: () => true }));
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({
      action,
      onSuccess,
    }: {
      action: () => Promise<unknown>;
      onSuccess?: (r: unknown) => void;
    }) => {
      const r = await action();
      onSuccess?.(r);
    },
}));
vi.mock("react-toastify", () => ({ toast: { warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t", permissao: auth.permissao } }),
}));
vi.mock("@/services/prepCourse/student/getStudentsEnrolled", () => ({
  getStudentsEnrolled: (...a: unknown[]) => getStudentsEnrolled(...a),
}));
vi.mock("@/services/prepCourse/inscription/getAllWithName", () => ({
  getAllWithName: async () => [],
}));
vi.mock("@/services/prepCourse/coursePeriod/getCoursePeriodYears", () => ({
  getCoursePeriodYears: async () => [],
}));
vi.mock("@/services/prepCourse/prepCourse/getPartnerLogo", () => ({
  getPartnerLogo: async () => new Blob(),
}));
vi.mock("heic2any", () => ({ default: vi.fn() }));

import { StudentsEnrolled } from ".";

const estudante = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  name: `Estudante ${id}`,
  email: `${id}@x.com`,
  whatsapp: "11 99999-0000",
  cod_enrolled: `M${id}`,
  applicationStatus: StatusApplication.Enrolled,
  class: { id: `c${id}`, name: "Turma A", year: 2026 },
  birthday: new Date("2000-01-02T12:00:00"),
  age: 26,
  ...over,
});

describe("StudentsEnrolled — tabela (desktop)", () => {
  beforeEach(() => {
    auth.permissao = { gerenciarEstudantes: true };
    getStudentsEnrolled.mockReset();
    getStudentsEnrolled.mockResolvedValue({
      name: "Cursinho",
      partnerId: null,
      students: {
        totalItems: 40,
        data: [
          estudante("1"),
          estudante("2", { applicationStatus: StatusApplication.EnrollmentCancelled }),
          estudante("3", { class: undefined }),
        ],
      },
    });
  });

  it("só matriculados com turma podem ser selecionados para as carteirinhas", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    expect(screen.getByRole("checkbox", { name: /^Selecionar Estudante 1/ })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: /^Selecionar Estudante 2/ })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /^Selecionar Estudante 3/ })).toBeDisabled();
    expect(screen.getByText("Sem Turma")).toBeInTheDocument();

    const carteirinhas = screen.getByRole("button", { name: /Carteirinhas/ });
    expect(carteirinhas).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: /^Selecionar Estudante 1/ }));
    expect(carteirinhas).toBeEnabled();
  });

  it("a seleção é da página: trocar de página zera a contagem e as carteirinhas", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    fireEvent.click(screen.getByRole("checkbox", { name: /^Selecionar Estudante 1/ }));
    expect(screen.getByText("1 item selecionado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Carteirinhas/ })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    await waitFor(() => expect(getStudentsEnrolled).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText("1 item selecionado")).toBeNull());
    expect(screen.getByRole("button", { name: /Carteirinhas/ })).toBeDisabled();
  });

  it("ordenar e filtrar também zeram a seleção", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    fireEvent.click(screen.getByRole("checkbox", { name: /^Selecionar Estudante 1/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Email/ }));
    await waitFor(() => expect(screen.queryByText("1 item selecionado")).toBeNull());

    fireEvent.click(await screen.findByRole("checkbox", { name: /^Selecionar Estudante 1/ }));
    expect(screen.getByText("1 item selecionado")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Valor do filtro" }), {
      target: { value: "1" },
    });
    await waitFor(() => expect(screen.queryByText("1 item selecionado")).toBeNull());
  });

  it("sem gerenciar estudantes não há caixas de seleção", async () => {
    auth.permissao = {};
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("paginação no servidor: a página 2 da tela vira page=2 na api", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    await waitFor(() =>
      expect(getStudentsEnrolled).toHaveBeenLastCalledWith(
        "t", 2, 15, undefined, undefined, undefined, undefined, undefined, "",
      ),
    );
  });

  it("ordenar pelo cabeçalho pede a ordenação ao servidor, voltando à página 1", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    fireEvent.click(screen.getByRole("button", { name: /^Email/ }));
    await waitFor(() =>
      expect(getStudentsEnrolled).toHaveBeenLastCalledWith(
        "t", 1, 15, undefined, undefined, { field: "email", sort: "asc" }, undefined, undefined, "",
      ),
    );
  });

  it("nome e idade só reordenam a página: a api não os aceita", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    const chamadas = getStudentsEnrolled.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /^Nome/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Nome/ }));
    const tabela = screen.getByRole("table");
    const nomes = within(tabela)
      .getAllByRole("row")
      .slice(1)
      .map((r) => r.querySelector('[data-column-id="name"]')?.textContent);
    expect(nomes).toEqual(["Estudante 3", "Estudante 2", "Estudante 1"]);
    expect(getStudentsEnrolled.mock.calls.length).toBe(chamadas);
  });

  it("filtro por coluna manda field, value e operator", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante 1");
    fireEvent.change(screen.getByRole("textbox", { name: "Valor do filtro" }), {
      target: { value: "123" },
    });
    await waitFor(
      () =>
        expect(getStudentsEnrolled).toHaveBeenLastCalledWith(
          "t", 1, 15, undefined,
          { field: "cod_enrolled", value: "123", operator: "contains" },
          undefined, undefined, undefined, "",
        ),
      { timeout: 3000 },
    );
  });
});
