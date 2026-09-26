import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Roles } from "@/enums/roles/roles";
import { StatusEnum } from "@/enums/generic/statusEnum";
import DashContent, { MATERIA_TODAS, STATUS_PADRAO } from ".";

const getTodoConteudo = vi.hoisted(() => vi.fn());
vi.mock("@/services/content/getContent", () => ({ getTodoConteudo }));
vi.mock("@/services/content/getMaterias", () => ({
  getMaterias: vi.fn().mockResolvedValue([
    { _id: "m1", nome: "Matemática" },
    { _id: "m2", nome: "Física" },
  ]),
}));

const auth = vi.hoisted(() => ({
  data: { token: "tok", permissao: {} as Record<string, boolean> },
}));
vi.mock("@/store/auth", () => ({ useAuthStore: () => auth }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Os modais não interessam aqui — só se abrem, e com qual demanda.
vi.mock("./modals/showDemand", () => ({
  default: ({ demand }: { demand: { title: string } }) => (
    <div data-modal="show">{demand.title}</div>
  ),
}));
vi.mock("./modals/validatedDemand", () => ({
  default: ({ demand }: { demand: { title: string } }) => (
    <div data-modal="validated">{demand.title}</div>
  ),
}));
vi.mock("./modals/newDemand", () => ({
  default: ({ addDemand }: { addDemand: (d: unknown) => void }) => (
    <div data-modal="new">
      <button onClick={() => addDemand({})}>criar</button>
    </div>
  ),
}));
vi.mock("./modals/settingsFrente", () => ({
  default: () => <div data-modal="settings" />,
}));

const demanda = (id: string, title: string, over: object = {}) => ({
  id,
  title,
  description: "descrição",
  status: STATUS_PADRAO,
  createdAt: "2026-09-01T12:00:00Z",
  subject: { id: "s1", name: "Funções", frente: { nome: "Álgebra", materia: "m1" } },
  ...over,
});

const select = (nome: string) =>
  screen.findByRole("combobox", { name: nome }) as Promise<HTMLSelectElement>;

beforeEach(() => {
  getTodoConteudo.mockReset().mockResolvedValue([
    demanda("d1", "Aula de funções"),
    demanda("d2", "Lista de limites"),
  ]);
  auth.data.permissao = {};
});

describe("DashContent (dashV2)", () => {
  it("lista as demandas da fila padrão com título, frente e tema", async () => {
    render(<DashContent />);

    expect(await screen.findByText("Aula de funções")).toBeTruthy();
    expect(screen.getByText("Lista de limites")).toBeTruthy();
    expect(screen.getAllByText("Álgebra").length).toBeGreaterThan(0);
    expect(getTodoConteudo).toHaveBeenCalledWith(
      "tok",
      STATUS_PADRAO,
      MATERIA_TODAS,
    );
  });

  it("⚠️ sem permissão de gestão, nenhuma das duas ações aparece", async () => {
    render(<DashContent />);
    await screen.findByText("Aula de funções");

    expect(screen.queryByRole("button", { name: "Nova Demanda" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Matérias e frentes" })).toBeNull();
  });

  it.each([Roles.editarMateriasFrentes, Roles.gerenciadorDemanda])(
    "com %s, as duas ações aparecem e abrem os modais",
    async (role) => {
      auth.data.permissao = { [role]: true };
      const { container } = render(<DashContent />);
      await screen.findByText("Aula de funções");

      fireEvent.click(screen.getByRole("button", { name: "Matérias e frentes" }));
      expect(container.querySelector('[data-modal="settings"]')).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Nova Demanda" }));
      expect(container.querySelector('[data-modal="new"]')).toBeTruthy();
    },
  );

  it("⚠️ criar demanda recarrega a lista — antes só aparecia no F5", async () => {
    auth.data.permissao = { [Roles.gerenciadorDemanda]: true };
    render(<DashContent />);
    await screen.findByText("Aula de funções");
    getTodoConteudo.mockResolvedValue([
      demanda("d1", "Aula de funções"),
      demanda("d2", "Lista de limites"),
      demanda("d3", "Demanda nova"),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Nova Demanda" }));
    fireEvent.click(screen.getByText("criar"));

    expect(await screen.findByText("Demanda nova")).toBeTruthy();
  });

  it("⚠️ matéria e status filtram no servidor, e limpar volta à fila padrão", async () => {
    render(<DashContent />);
    await screen.findByText("Aula de funções");

    fireEvent.change(await select("Matéria"), { target: { value: "m1" } });
    await waitFor(() =>
      expect(getTodoConteudo).toHaveBeenLastCalledWith("tok", STATUS_PADRAO, "m1"),
    );

    fireEvent.change(await select("Status"), {
      target: { value: String(StatusEnum.Approved) },
    });
    await waitFor(() =>
      expect(getTodoConteudo).toHaveBeenLastCalledWith(
        "tok",
        StatusEnum.Approved,
        "m1",
      ),
    );

    fireEvent.click(await screen.findByRole("button", { name: /Limpar filtros/ }));
    await waitFor(() =>
      expect(getTodoConteudo).toHaveBeenLastCalledWith(
        "tok",
        STATUS_PADRAO,
        MATERIA_TODAS,
      ),
    );
    expect((await select("Matéria")).value).toBe(MATERIA_TODAS);
    expect((await select("Status")).value).toBe(String(STATUS_PADRAO));
  });

  it("clicar na demanda abre o detalhe dela", async () => {
    auth.data.permissao = { [Roles.uploadDemanda]: true };
    const { container } = render(<DashContent />);

    fireEvent.click(await screen.findByText("Lista de limites"));

    expect(container.querySelector('[data-modal="show"]')?.textContent).toBe(
      "Lista de limites",
    );
  });

  it("erro ao carregar mostra o erro, e tentar de novo refaz a busca", async () => {
    getTodoConteudo.mockRejectedValueOnce(new Error("boom"));
    render(<DashContent />);

    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Aula de funções")).toBeTruthy();
    expect(getTodoConteudo).toHaveBeenCalledTimes(2);
  });
});
