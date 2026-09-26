import {
  TEXTO_ERRO,
  TEXTO_TENTAR_DE_NOVO,
} from "@/components/dashV2";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerPrepInscriptionManager, TEXTO_SEM_PROCESSOS } from ".";

/*
  Card 04 da série `tickets/021-dash-v2-processo-seletivo`: a tela na Dash V2.
  O que está sob teste é a tela — os modais têm vida própria e entram como
  dublês que só dizem "abri, com este processo".
*/
const getTodasAsInscricoes = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/inscription/getAllInscription", () => ({
  getTodasAsInscricoes,
}));
vi.mock("@/services/prepCourse/inscription/createInscription", () => ({
  createInscription: vi.fn(),
}));
vi.mock("@/services/prepCourse/inscription/updateInscription", () => ({
  updateInscription: vi.fn(),
}));
vi.mock("@/services/prepCourse/inscription/deleteInscription", () => ({
  deleteInscription: vi.fn(),
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));
vi.mock("./modals/InscriptionInfoModal", () => ({
  InscriptionInfoModal: ({ inscription }: { inscription?: { name: string } }) => (
    <div data-modal-info>{inscription?.name}</div>
  ),
}));
vi.mock("./modals/InscriptionInfoCreateEditModal", () => ({
  InscriptionInfoCreateEditModal: () => <div data-modal-criar />,
}));

const dia = (iso: string) => new Date(iso);
const processo = (over: object) => ({
  id: "p",
  name: "Processo",
  description: "",
  startDate: dia("2026-03-01T03:00:00Z"),
  endDate: dia("2099-04-01T03:00:00Z"),
  openingsCount: 50,
  subscribersCount: 10,
  actived: StatusEnum.Approved,
  createdAt: dia("2026-02-01T03:00:00Z"),
  updatedAt: dia("2026-02-01T03:00:00Z"),
  partnerPrepCourseId: "c1",
  partnerPrepCourseName: "Cursinho",
  requestDocuments: false,
  isTest: false,
  ...over,
});

const PROCESSOS = [
  processo({ id: "a", name: "Antigo 2024", startDate: dia("2024-03-01T03:00:00Z"), endDate: dia("2024-04-01T03:00:00Z") }),
  processo({ id: "b", name: "Atual 2026", startDate: dia("2026-03-01T03:00:00Z") }),
  processo({ id: "c", name: "Meio 2025", startDate: dia("2025-03-01T03:00:00Z"), endDate: dia("2025-04-01T03:00:00Z") }),
];

const montar = () =>
  render(
    <MemoryRouter>
      <PartnerPrepInscriptionManager />
    </MemoryRouter>,
  );

/** Os nomes na ordem em que a tabela mostra. */
const nomesNaTabela = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((linha) => linha.textContent ?? "")
    .map((texto) => PROCESSOS.find((p) => texto.includes(p.name))?.name);

describe("Processos Seletivos na Dash V2 (tickets/021 card 04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTodasAsInscricoes.mockResolvedValue(PROCESSOS);
  });

  it("⚠️ ordena pelo início, do mais recente para o mais antigo (decisão de 2026-09-26)", async () => {
    montar();
    await screen.findByText("Atual 2026");
    expect(nomesNaTabela()).toEqual(["Atual 2026", "Meio 2025", "Antigo 2024"]);
  });

  it("status na coluna: encerrado pela data, ativo pelo gravado", async () => {
    montar();
    const linhaAntiga = (await screen.findByText("Antigo 2024")).closest("tr")!;
    const linhaAtual = screen.getByText("Atual 2026").closest("tr")!;
    expect(within(linhaAntiga).getByText("Encerrado")).toBeTruthy();
    expect(within(linhaAtual).getByText("Ativo")).toBeTruthy();
  });

  it("clicar no processo abre o mesmo modal de detalhe, com ele", async () => {
    const { container } = montar();
    fireEvent.click(await screen.findByRole("button", { name: "Meio 2025" }));
    expect(container.querySelector("[data-modal-info]")?.textContent).toBe("Meio 2025");
  });

  it("'Novo processo seletivo' abre o modal de criação", async () => {
    const { container } = montar();
    fireEvent.click(await screen.findByRole("button", { name: "Novo processo seletivo" }));
    expect(container.querySelector("[data-modal-criar]")).toBeTruthy();
  });

  it("filtro de status continua, controlado; limpar volta a todos", async () => {
    montar();
    await screen.findByText("Atual 2026");

    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: String(StatusEnum.Rejected) },
    });
    expect(nomesNaTabela()).toEqual(["Meio 2025", "Antigo 2024"]);

    fireEvent.click(screen.getByRole("button", { name: /Limpar filtros/ }));
    expect(nomesNaTabela()).toHaveLength(3);
    expect(
      (screen.getByRole("combobox", { name: "Status" }) as HTMLSelectElement).value,
    ).toBe(String(StatusEnum.All));
  });

  it("⚠️ erro de busca: estado de erro com 'tentar de novo' — não o spinner eterno", async () => {
    getTodasAsInscricoes.mockRejectedValueOnce(new Error("rede"));
    montar();

    expect(await screen.findByText(TEXTO_ERRO)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: TEXTO_TENTAR_DE_NOVO }));

    expect(await screen.findByText("Atual 2026")).toBeTruthy();
    expect(getTodasAsInscricoes).toHaveBeenCalledTimes(2);
  });

  it("sem nenhum processo: o vazio próprio da tela", async () => {
    getTodasAsInscricoes.mockResolvedValue([]);
    montar();
    expect(await screen.findByText(TEXTO_SEM_PROCESSOS)).toBeTruthy();
  });

  it("processo de teste leva o selo", async () => {
    getTodasAsInscricoes.mockResolvedValue([processo({ id: "t", name: "Simulação", isTest: true })]);
    montar();
    const linha = (await screen.findByText("Simulação")).closest("tr")!;
    expect(within(linha).getByText("Teste")).toBeTruthy();
  });

  it("a busca carrega a lista inteira uma vez ao abrir", async () => {
    montar();
    await waitFor(() => expect(getTodasAsInscricoes).toHaveBeenCalledWith("tok"));
    expect(getTodasAsInscricoes).toHaveBeenCalledTimes(1);
  });
});
