import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ inscritos: vi.fn() }));

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: {} } }),
}));
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), warn: vi.fn(), success: vi.fn(), loading: vi.fn() },
}));
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({
      action,
      onSuccess,
    }: {
      action: () => Promise<unknown>;
      onSuccess?: (r: unknown) => void;
    }) => onSuccess?.(await action()),
}));
vi.mock("@/services/prepCourse/inscription/getSubscribers", () => ({
  getSubscribers: svc.inscritos,
}));
vi.mock("@/services/prepCourse/getInscription", () => ({
  getInscription: vi.fn().mockResolvedValue({ inscription: null }),
}));
vi.mock("@/services/partnerPrepForm/getRuleSetByInscription", () => ({
  getRuleSetByInscription: vi.fn().mockResolvedValue({}),
}));

import { PartnerPrepInscritionStudentManager } from "./index";

const inscrito = (n: number) => ({
  id: `i${n}`,
  userId: `u${n}`,
  nome: `Nome ${String(n).padStart(2, "0")}`,
  sobrenome: "Silva",
  email: `a${n}@exemplo.org`,
  cpf: "00000000000",
  status: "UnderReview",
  isento: "Sim",
  lista_de_espera: "Não",
  convocar: "Não",
  data_convocacao: null,
  data_limite_convocacao: null,
});

const abrir = () =>
  render(
    <MemoryRouter initialEntries={["/inscritos/p1"]}>
      <Routes>
        <Route path="/inscritos/:inscriptionId" element={<PartnerPrepInscritionStudentManager />} />
      </Routes>
    </MemoryRouter>,
  );

describe("PartnerPrepInscritionStudentManager — tabela de inscritos", () => {
  beforeEach(() => {
    svc.inscritos.mockResolvedValue(Array.from({ length: 12 }, (_, i) => inscrito(i + 1)));
  });

  it("pagina de 10 em 10, ordena pelo cabeçalho e mostra '—' sem ranking", async () => {
    abrir();
    expect(await screen.findByText("Nome 01")).toBeInTheDocument();
    expect(screen.queryByText("Nome 11")).toBeNull();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(await screen.findByText("Nome 11")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Nome$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Nome$/ }));
    expect(screen.getByText("Nome 02")).toBeInTheDocument();
  });
});
