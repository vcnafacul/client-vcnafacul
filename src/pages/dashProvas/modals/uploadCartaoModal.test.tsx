import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import UploadCartaoModal, {
  TEXTO_DIGITE_MAIS,
  TEXTO_NADA_ENCONTRADO,
  TEXTO_SEM_TURMA,
  TEXTO_TROCAR,
} from "./uploadCartaoModal";
import { DEBOUNCE_MS } from "./useBuscaDeEstudantes";

const buscarEstudantes = vi.hoisted(() => vi.fn());
const uploadCartao = vi.hoisted(() => vi.fn());
const toastUpdate = vi.hoisted(() => vi.fn());
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(() => 1), update: toastUpdate, error: vi.fn() },
}));
vi.mock("@/services/cartaoResposta/buscarEstudantes", () => ({
  buscarEstudantes,
}));
vi.mock("../../../services/cartaoResposta/uploadCartao", () => ({
  uploadCartao,
}));

const ANA = {
  userId: "u1",
  nome: "Ana Silva",
  matricula: "20250185",
  turma: "Turma A",
};
const SEM_TURMA = {
  userId: "u2",
  nome: "Bruno Souza",
  matricula: "20250186",
  turma: null,
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  buscarEstudantes.mockResolvedValue({ estudantes: [ANA, SEM_TURMA] });
});
afterEach(() => vi.useRealTimers());

const montar = () =>
  render(
    <UploadCartaoModal isOpen handleClose={vi.fn()} token="tok" />,
  );

const digitar = (texto: string) =>
  fireEvent.change(screen.getByTestId("busca-estudante"), {
    target: { value: texto },
  });

describe("UploadCartaoModal — busca", () => {
  it("⚠️ NÃO existe mais botão Buscar", () => {
    // O botão obrigava um clique a mais por tentativa, e numa busca por nome
    // quase sempre são várias tentativas.
    montar();

    expect(
      screen.queryByRole("button", { name: /^buscar$/i }),
    ).not.toBeInTheDocument();
  });

  it("⚠️ o campo aceita NOME, não só matrícula", async () => {
    montar();
    digitar("Ana Silva");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    await waitFor(() =>
      expect(buscarEstudantes).toHaveBeenCalledWith("Ana Silva", "tok"),
    );
  });

  it("com menos que o mínimo, avisa quantos faltam", () => {
    montar();
    digitar("An");

    expect(screen.getByText(TEXTO_DIGITE_MAIS)).toBeInTheDocument();
    expect(buscarEstudantes).not.toHaveBeenCalled();
  });

  it("⚠️ a lista mostra nome em cima, matrícula e turma embaixo", async () => {
    montar();
    digitar("Ana");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    await screen.findByText("Ana Silva");
    expect(screen.getByText(/20250185 · Turma A/)).toBeInTheDocument();
  });

  it("⚠️ estudante sem turma mostra rótulo, não célula vazia", async () => {
    montar();
    digitar("Bruno");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    await screen.findByText("Bruno Souza");
    expect(
      screen.getByText(new RegExp(`20250186 · ${TEXTO_SEM_TURMA}`)),
    ).toBeInTheDocument();
  });

  it("nada encontrado diz isso, em vez de lista vazia muda", async () => {
    buscarEstudantes.mockResolvedValue({ estudantes: [] });
    montar();
    digitar("Zzz");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(await screen.findByText(TEXTO_NADA_ENCONTRADO)).toBeInTheDocument();
  });
});

describe("UploadCartaoModal — escolha", () => {
  const escolherAna = async () => {
    montar();
    digitar("Ana");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    fireEvent.click(await screen.findByText("Ana Silva"));
  };

  it("⚠️ ao escolher, a LISTA some e o escolhido aparece", async () => {
    await escolherAna();

    await waitFor(() =>
      expect(screen.queryByTestId("sugestoes-estudante")).not.toBeInTheDocument(),
    );
    expect(screen.queryByTestId("busca-estudante")).not.toBeInTheDocument();
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
  });

  it("⚠️ 'Trocar' devolve a busca — escolha errada é corrigível", async () => {
    // O envio é a ação que não dá para desfazer; sem o Trocar, corrigir
    // exigiria fechar o modal e recomeçar.
    await escolherAna();
    fireEvent.click(screen.getByText(TEXTO_TROCAR));

    expect(screen.getByTestId("busca-estudante")).toBeInTheDocument();
  });

  it("⚠️ o cartão é enviado para o userId do ESCOLHIDO", async () => {
    uploadCartao.mockResolvedValue(undefined);
    await escolherAna();

    const arquivo = new File(["x"], "cartao.jpg", { type: "image/jpeg" });
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [arquivo] } });
    fireEvent.click(screen.getByRole("button", { name: /enviar cartão/i }));

    await waitFor(() =>
      expect(uploadCartao).toHaveBeenCalledWith(arquivo, "u1", "tok"),
    );
  });
});

describe("UploadCartaoModal — os 'Últimos resultados' saíram", () => {
  it("⚠️ não mostra histórico do estudante", async () => {
    // A tela serve para escolher para quem o cartão vai; os resultados
    // anteriores são outra tela, e ali só ocupavam espaço.
    montar();
    digitar("Ana");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    fireEvent.click(await screen.findByText("Ana Silva"));

    expect(screen.queryByText(/últimos resultados/i)).not.toBeInTheDocument();
  });
});

describe("UploadCartaoModal — o toast do envio", () => {
  /*
    ⚠️ **Preservado do arquivo anterior**, adaptado ao fluxo novo de escolha.

    Os outros dois testes daquele arquivo cobriam a lista de "Últimos
    resultados", que saiu desta tela de propósito — o motivo da falha vive
    agora no relatório de simulado (coluna "Motivo" e o modal de detalhe).
    Este não: o toast continua igual, e a afirmação que ele faz continua
    importando.
  */
  it("⚠️ o toast não afirma que o PROCESSAMENTO deu certo — só o upload", async () => {
    uploadCartao.mockResolvedValue(undefined);
    montar();
    digitar("Ana");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    fireEvent.click(await screen.findByText("Ana Silva"));

    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, {
      target: { files: [new File(["x"], "c.jpg", { type: "image/jpeg" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar cartão/i }));

    await waitFor(() => expect(toastUpdate).toHaveBeenCalled());
    const texto = toastUpdate.mock.calls[0][1].render as string;
    // o sucesso é do UPLOAD; a leitura ainda vai acontecer
    expect(texto).not.toMatch(/Processando/i);
    expect(texto).toMatch(/quando o processamento terminar/i);
  });
});
