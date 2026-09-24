import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ModalDoUsuario from "./ModalDoUsuario";
import { dataBR } from "./dataBR";

const getResumoDoUsuario = vi.hoisted(() => vi.fn());
vi.mock("../../../services/roles/getResumoDoUsuario", () => ({
  getResumoDoUsuario,
}));
vi.mock("../../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

const inscricao = (status: string, over = {}) => ({
  cursinho: { id: "c1", nome: "Cursinho Popular" },
  processo: { id: "p1", nome: "Processo 2026" },
  status,
  turma: "Turma A",
  em: "2026-02-01T02:00:00Z",
  ...over,
});

const resumo = (over: Record<string, unknown> = {}) => ({
  conta: {
    id: "u1",
    nome: "Maria da Silva",
    nomeSocial: null,
    usaNomeSocial: false,
    email: "maria@x.com",
    telefone: "11999999999",
    cidade: "São Paulo",
    uf: "SP",
    cadastradoEm: "2026-01-10T12:00:00Z",
    ultimoAcesso: null,
    emailConfirmado: true,
    desativada: false,
    funcao: { id: "r1", nome: "aluno" },
  },
  colaborador: null,
  estudante: { atual: [], historico: [] },
  ...over,
});

const secao = (id: string) =>
  document.querySelector(`[data-secao='${id}']`)?.textContent ?? "";

const abrir = async (openUpdateRole = vi.fn()) => {
  render(
    <ModalDoUsuario
      isOpen
      userId="u1"
      funcao="aluno"
      openUpdateRole={openUpdateRole}
      handleClose={vi.fn()}
    />,
  );
  await screen.findByText("maria@x.com");
};

describe("ModalDoUsuario (usuários 05)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("só aluno: conta preenchida e os vazios de cada seção", async () => {
    getResumoDoUsuario.mockResolvedValue(resumo());
    await abrir();

    expect(getResumoDoUsuario).toHaveBeenCalledWith("u1", "tok");
    expect(secao("conta")).toMatch(/São Paulo \/ SP/);
    expect(secao("conta")).toMatch(/Nunca/);
    expect(secao("funcao")).toMatch(/aluno/);
    expect(secao("colaborador")).toMatch(/Não é colaborador/);
    expect(secao("estudante-atual")).toMatch(/Não está matriculado/);
    expect(secao("estudante-historico")).toMatch(/Sem outras inscrições/);
  });

  it("colaborador: cursinho, situação e desde", async () => {
    getResumoDoUsuario.mockResolvedValue(
      resumo({
        colaborador: {
          cursinho: { id: "c1", nome: "Cursinho Popular" },
          ativo: false,
          desde: "2026-03-05T12:00:00Z",
        },
      }),
    );
    await abrir();

    expect(secao("colaborador")).toMatch(/Cursinho Popular/);
    expect(secao("colaborador")).toMatch(/Inativo/);
    expect(secao("colaborador")).toMatch(/05\/03\/2026/);
  });

  it("estudante atual: cursinho, processo e turma", async () => {
    getResumoDoUsuario.mockResolvedValue(
      resumo({ estudante: { atual: [inscricao("Matriculado")], historico: [] } }),
    );
    await abrir();

    expect(secao("estudante-atual")).toMatch(/Cursinho Popular/);
    expect(secao("estudante-atual")).toMatch(/Processo 2026/);
    expect(secao("estudante-atual")).toMatch(/Turma A/);
    expect(secao("estudante-historico")).toMatch(/Sem outras inscrições/);
  });

  it("ex-estudante: o histórico com status e data, e não matriculado", async () => {
    getResumoDoUsuario.mockResolvedValue(
      resumo({
        estudante: {
          atual: [],
          historico: [inscricao("Matrícula Encerrada"), inscricao("Indeferido")],
        },
      }),
    );
    await abrir();

    expect(secao("estudante-atual")).toMatch(/Não está matriculado/);
    expect(secao("estudante-historico")).toMatch(/Matrícula Encerrada/);
    expect(secao("estudante-historico")).toMatch(/Indeferido/);
  });

  it("⚠️ data no fuso de São Paulo — 02h UTC ainda é o dia anterior", () => {
    expect(dataBR("2026-02-01T02:00:00Z")).toBe("31/01/2026");
  });

  it("'Alterar função' chama a troca", async () => {
    getResumoDoUsuario.mockResolvedValue(resumo());
    const openUpdateRole = vi.fn();
    await abrir(openUpdateRole);

    fireEvent.click(screen.getByRole("button", { name: "Alterar função" }));

    expect(openUpdateRole).toHaveBeenCalledTimes(1);
  });

  it("erro da api aparece no lugar do conteúdo", async () => {
    getResumoDoUsuario.mockRejectedValue(new Error("Erro ao buscar o resumo do usuário"));
    render(
      <ModalDoUsuario isOpen userId="u1" funcao="" openUpdateRole={vi.fn()} handleClose={vi.fn()} />,
    );

    expect(await screen.findByText("Erro ao buscar o resumo do usuário")).toBeTruthy();
  });
});
