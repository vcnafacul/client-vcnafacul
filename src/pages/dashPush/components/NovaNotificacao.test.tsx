import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  conferirPublico: vi.fn(),
  enviarNotificacao: vi.fn(),
  buscarEnvio: vi.fn(),
  listarEnvios: vi.fn(),
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
  api.conferirPublico.mockResolvedValue({ targetUsers: 37, targetDevices: 52 });
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

  it("mudar o rascunho descarta o número conferido", async () => {
    await preencher();
    clicar("Conferir público");
    await screen.findByText(/37 pessoas/);
    escrever(/^Título/, "Outro título");
    await waitFor(() => expect(screen.queryByText(/37 pessoas/)).toBeNull());
  });
});
