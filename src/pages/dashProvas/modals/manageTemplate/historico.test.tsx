import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Historico from "./historico";
import { VersaoTemplate } from "../../../../services/caderno/template/tipos";

const listarVersoes = vi.fn();
const baixarModelo = vi.fn();
const restaurar = vi.fn();

vi.mock("../../../../services/caderno/template/listarVersoes", () => ({
  listarVersoes: (...args: unknown[]) => listarVersoes(...args),
}));
vi.mock("../../../../services/caderno/template/baixarModelo", () => ({
  baixarModelo: (...args: unknown[]) => baixarModelo(...args),
}));
vi.mock("../../../../services/caderno/template/restaurar", () => ({
  restaurar: (...args: unknown[]) => restaurar(...args),
}));

vi.mock("react-toastify", () => {
  const toast = Object.assign(vi.fn(), {
    loading: vi.fn(() => 1),
    update: vi.fn(),
    dismiss: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
  });
  return { toast };
});

function versao(numero: number, extra: Partial<VersaoTemplate> = {}) {
  const base: VersaoTemplate = {
    versao: numero,
    status: "arquivada",
    criadorId: "coordenacao",
    publicadaEm: "2026-03-04T12:00:00.000Z",
    notas: `notas da v${numero}`,
    origemVersao: null,
  };
  return { ...base, ...extra };
}

/**
 * O histórico do cenário da frase: v4 no ar, v2 é a que ele quer de volta.
 *
 * ⚠️ Com o rascunho na frente, como o ms devolve de verdade: `versoes()` é um
 * `find().sort({versao:-1})` sem filtro, e o rascunho sai com `versao: 0` — um
 * placeholder, porque a versão de um rascunho só é decidida no publicar.
 */
const HISTORICO = [
  versao(0, { status: "rascunho", publicadaEm: null, notas: "rascunho atual" }),
  versao(4, { status: "publicada" }),
  versao(3),
  versao(2),
  versao(1),
];

function renderHistorico(props: Partial<Parameters<typeof Historico>[0]> = {}) {
  const onRestaurado = vi.fn();
  const onVoltar = vi.fn();
  render(
    <Historico
      token="tok"
      versaoNoAr={4}
      onRestaurado={onRestaurado}
      onVoltar={onVoltar}
      {...props}
    />,
  );
  return { onRestaurado, onVoltar };
}

/** Abre a confirmação da v2 e devolve os espiões do render. */
async function abrirConfirmacaoDaV2(
  props: Partial<Parameters<typeof Historico>[0]> = {},
) {
  const espioes = renderHistorico(props);
  const linha = (await screen.findByText("v2")).closest("li")!;
  fireEvent.click(within(linha).getByRole("button", { name: "Restaurar" }));
  return espioes;
}

beforeEach(() => {
  vi.clearAllMocks();
  listarVersoes.mockResolvedValue(HISTORICO);
  baixarModelo.mockResolvedValue(new Blob(["zip"]));
  restaurar.mockResolvedValue(undefined);
  window.URL.createObjectURL = vi.fn(() => "blob:fake");
  window.URL.revokeObjectURL = vi.fn();
});

describe("Historico", () => {
  it("lista as versões na ordem que o ms devolveu, com data, autor e notas", async () => {
    renderHistorico();

    await screen.findByText("v4");
    const itens = document.querySelectorAll("li");
    expect([...itens].map((li) => li.querySelector("p")!.textContent)).toEqual([
      "v4no ar",
      "v3",
      "v2",
      "v1",
    ]);
    expect(
      screen.getAllByText(/Publicada em 04\/03\/2026 — por coordenacao/),
    ).toHaveLength(4);
    expect(screen.getByText("notas da v2")).toBeInTheDocument();
  });

  // ⚠️ O rascunho vem na resposta do ms e NÃO pode virar linha aqui: "v0" exibe
  // como versão um número que por decisão não é versão, duplica o que a aba
  // principal já mostra, e o Restaurar dele criaria um rascunho a partir dele
  // mesmo — no-op com cara de ação.
  it("não traz o rascunho para o histórico, mesmo o ms devolvendo ele", async () => {
    renderHistorico();

    await screen.findByText("v4");
    expect(screen.queryByText("v0")).not.toBeInTheDocument();
    expect(screen.queryByText("rascunho atual")).not.toBeInTheDocument();
    expect(document.querySelectorAll("li")).toHaveLength(4);
  });

  it("baixa a versão da linha, não a publicada", async () => {
    renderHistorico();

    const linha = (await screen.findByText("v2")).closest("li")!;
    fireEvent.click(within(linha).getByRole("button", { name: "Baixar" }));

    await waitFor(() => expect(baixarModelo).toHaveBeenCalledTimes(1));
    expect(baixarModelo).toHaveBeenCalledWith({ versao: 2 }, "tok");
  });

  // ⚠️ O teste desta aba inteira: restaurar não é reverter, e a frase é o
  // único lugar onde isso é dito.
  it("diz, antes de restaurar, que isto cria um rascunho e que a publicada não muda", async () => {
    await abrirConfirmacaoDaV2();

    expect(
      screen.getByText(
        "Isto cria um rascunho a partir da v2. A v4 continua publicada até você publicar o rascunho.",
      ),
    ).toBeInTheDocument();
    // Confirmação é confirmação: nada foi restaurado ainda.
    expect(restaurar).not.toHaveBeenCalled();
  });

  it("sem versão publicada, não promete que uma continua no ar", async () => {
    await abrirConfirmacaoDaV2({ versaoNoAr: null });

    expect(
      screen.getByText(
        "Isto cria um rascunho a partir da v2. Nenhuma versão está publicada hoje, e continua assim até você publicar o rascunho.",
      ),
    ).toBeInTheDocument();
  });

  it("cancelar não restaura nada", async () => {
    const { onRestaurado } = await abrirConfirmacaoDaV2();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(restaurar).not.toHaveBeenCalled();
    expect(onRestaurado).not.toHaveBeenCalled();
    expect(await screen.findByText("Histórico de versões")).toBeInTheDocument();
  });

  it("confirmando, restaura a versão da linha e volta para a aba principal", async () => {
    const { onRestaurado } = await abrirConfirmacaoDaV2();

    fireEvent.click(
      screen.getByRole("button", { name: "Criar rascunho a partir da v2" }),
    );

    await waitFor(() => expect(onRestaurado).toHaveBeenCalledTimes(1));
    expect(restaurar).toHaveBeenCalledWith(2, "tok");
  });

  // ⚠️ Se o restaurar falhou, a aba principal NÃO pode ser aberta prometendo
  // um rascunho que não existe.
  it("restaurar que falhou não devolve para a aba principal", async () => {
    restaurar.mockRejectedValue(new Error("não deu"));
    const { onRestaurado } = await abrirConfirmacaoDaV2();

    fireEvent.click(
      screen.getByRole("button", { name: "Criar rascunho a partir da v2" }),
    );

    await waitFor(() => expect(restaurar).toHaveBeenCalledTimes(1));
    expect(onRestaurado).not.toHaveBeenCalled();
  });
});
