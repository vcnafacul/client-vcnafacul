import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  conferirPublico: vi.fn(),
  enviarNotificacao: vi.fn(),
  buscarEnvio: vi.fn(),
  listarEnvios: vi.fn(),
  buscarDestinatarios: vi.fn(),
}));
vi.mock("@/services/push/admin", () => api);
vi.mock("@/services/roles/getRoles", () => ({
  getRoles: vi.fn(async () => ({
    data: [
      { id: 0, name: "Todos" },
      { id: "r-admin", name: "Admin" },
      { id: "r-aluno", name: "Estudante" },
    ],
  })),
}));

import { NovaNotificacao } from "./NovaNotificacao";

const escrever = (rotulo: RegExp | string, valor: string) =>
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
const clicar = (nome: RegExp | string) =>
  fireEvent.click(screen.getByRole("button", { name: nome }));

async function preencher() {
  render(<NovaNotificacao />);
  escrever(/^Título/, "Simulado liberado");
  escrever(/^Mensagem/, "O simulado de sábado já está no ar.");
  fireEvent.click(await screen.findByLabelText("Admin"));
}

beforeEach(() => {
  vi.clearAllMocks();
  api.conferirPublico.mockResolvedValue({
    targetUsers: 37,
    targetDevices: 52,
    pessoas: 37,
  });
  api.enviarNotificacao.mockResolvedValue({
    id: "e1",
    status: "sending",
    targetUsers: 37,
    targetDevices: 52,
  });
  api.buscarEnvio.mockResolvedValue({
    id: "e1",
    status: "done",
    successCount: 50,
    failureCount: 2,
  });
});

describe("NovaNotificacao", () => {
  it("o 'Todos' falso do getRoles não vira opção", async () => {
    render(<NovaNotificacao />);
    await screen.findByLabelText("Admin");
    expect(
      screen.getByRole("group", { name: "Funções" }),
    ).not.toHaveTextContent("Todos");
  });

  it("⚠️ valida antes de chamar a api", async () => {
    render(<NovaNotificacao />);
    escrever("Link ao clicar (opcional)", "https://golpe.example");
    clicar("Enviar");

    expect(await screen.findByText("Escreva um título")).toBeInTheDocument();
    expect(
      screen.getByText("Use um caminho do site, como /simulados"),
    ).toBeInTheDocument();
    expect(screen.getByText("Escolha ao menos uma função")).toBeInTheDocument();
    expect(api.conferirPublico).not.toHaveBeenCalled();
    expect(api.enviarNotificacao).not.toHaveBeenCalled();
  });

  it("Conferir público mostra os números da api", async () => {
    await preencher();
    clicar("Conferir público");
    expect(await screen.findByText(/37 pessoas/)).toBeInTheDocument();
    expect(api.conferirPublico).toHaveBeenCalledWith(
      { type: "roles", roleIds: ["r-admin"] },
      expect.any(String),
    );
  });

  it("envio por função: confirma, envia e acompanha até concluir", async () => {
    await preencher();
    escrever("Link ao clicar (opcional)", "/simulados");
    clicar("Enviar");
    await screen.findByRole("region", { name: "Confirmar envio" });
    clicar("Confirmar envio");

    expect(
      await screen.findByText(/50 entregues ao FCM · 2 falharam/),
    ).toBeInTheDocument();
    expect(api.enviarNotificacao).toHaveBeenCalledWith(
      {
        title: "Simulado liberado",
        body: "O simulado de sábado já está no ar.",
        url: "/simulados",
        audience: { type: "roles", roleIds: ["r-admin"] },
      },
      expect.any(String),
    );
  });

  it("⚠️ para TODOS, só confirma depois de digitar ENVIAR", async () => {
    render(<NovaNotificacao />);
    escrever(/^Título/, "Aviso geral");
    escrever(/^Mensagem/, "Para todo mundo.");
    fireEvent.click(screen.getByLabelText("Todos"));
    clicar("Enviar");
    await screen.findByRole("region", { name: "Confirmar envio" });

    const confirmar = screen.getByRole("button", { name: "Confirmar envio" });
    expect(confirmar).toBeDisabled();
    escrever("Confirmação", "enviar");
    expect(confirmar).toBeDisabled();
    escrever("Confirmação", "ENVIAR");
    expect(confirmar).toBeEnabled();
  });

  it("público vazio: a mensagem do 422 aparece e nada fica 'enviado'", async () => {
    api.enviarNotificacao.mockRejectedValue(
      new Error("Ninguém nesse público ativou as notificações"),
    );
    await preencher();
    clicar("Enviar");
    await screen.findByRole("region", { name: "Confirmar envio" });
    clicar("Confirmar envio");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ninguém nesse público",
    );
    expect(api.buscarEnvio).not.toHaveBeenCalled();
  });

  it("pessoas específicas: busca por nome, mostra quem ativou e envia pelo e-mail achado", async () => {
    api.buscarDestinatarios.mockResolvedValue([
      { id: "u1", name: "Maria Silva", email: "Maria@x.com", devices: 2 },
      { id: "u2", name: "Mario Souza", email: "mario@x.com", devices: 0 },
    ]);
    render(<NovaNotificacao />);
    escrever(/^Título/, "Oi");
    escrever(/^Mensagem/, "Só para você.");
    fireEvent.click(screen.getByLabelText("Pessoas específicas"));
    escrever("Buscar pessoa por nome ou e-mail", "mari");

    const resultados = await screen.findByRole("list", {
      name: "Resultados da busca",
    });
    expect(api.buscarDestinatarios).toHaveBeenCalledWith(
      "mari",
      expect.any(String),
    );
    expect(resultados).toHaveTextContent("2 aparelhos ativos");
    expect(resultados).toHaveTextContent("Não ativou as notificações");

    fireEvent.click(screen.getByRole("button", { name: /Maria Silva/ }));
    expect(
      screen.getByRole("list", { name: "Pessoas escolhidas" }),
    ).toHaveTextContent("Maria Silva");

    clicar("Conferir público");
    await screen.findByText(/37 pessoas/);
    expect(api.conferirPublico).toHaveBeenCalledWith(
      { type: "emails", emails: ["maria@x.com"] },
      expect.any(String),
    );
  });

  it("pessoas específicas sem ninguém escolhido não chama a api", async () => {
    render(<NovaNotificacao />);
    escrever(/^Título/, "Oi");
    escrever(/^Mensagem/, "Só para você.");
    fireEvent.click(screen.getByLabelText("Pessoas específicas"));
    clicar("Enviar");
    expect(
      await screen.findByText("Escolha ao menos uma pessoa"),
    ).toBeInTheDocument();
    expect(api.conferirPublico).not.toHaveBeenCalled();
  });

  it("⚠️ conferir mostra quem vê na central E quem tem push", async () => {
    api.conferirPublico.mockResolvedValue({
      targetUsers: 3,
      targetDevices: 4,
      pessoas: 10,
    });
    await preencher();
    clicar("Conferir público");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Vai chegar em 10 pessoas na central do app; 3 delas com push (4 aparelhos).",
    );
  });

  it("mudar o rascunho descarta o número conferido", async () => {
    await preencher();
    clicar("Conferir público");
    await screen.findByText(/37 pessoas/);
    escrever(/^Título/, "Outro título");
    await waitFor(() => expect(screen.queryByText(/37 pessoas/)).toBeNull());
  });
});
