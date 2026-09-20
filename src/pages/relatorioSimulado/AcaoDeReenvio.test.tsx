import { fireEvent } from "@testing-library/dom";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AcaoDeReenvio,
  TEXTO_ENVIANDO,
  TEXTO_REENVIAR,
  TEXTO_REPROCESSAR,
} from "./AcaoDeReenvio";

const reprocessarCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/cartaoResposta/reprocessarCartao", () => ({
  reprocessarCartao,
}));

const falha = (acaoSugerida: string) => ({
  codigo: "cartao_nao_detectado",
  descricao: "Não foi possível localizar o cartão na foto",
  acaoSugerida,
});

const montar = (acao: string, over = {}) =>
  render(
    <AcaoDeReenvio
      token="tok"
      historicoId="h1"
      falha={falha(acao) as never}
      onReenviado={vi.fn()}
      {...over}
    />,
  );

const arquivo = new File(["foto"], "cartao.jpg", { type: "image/jpeg" });

const escolherArquivo = (container: HTMLElement, file = arquivo) => {
  const input = container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
  return input;
};

describe("AcaoDeReenvio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reprocessarCartao.mockResolvedValue(undefined);
  });

  it("⚠️ reenviar_foto pede arquivo", async () => {
    const { container } = montar("reenviar_foto");

    expect(container.querySelector('input[type="file"]')).toBeTruthy();
    expect(screen.getByText(TEXTO_REENVIAR)).toBeInTheDocument();
  });

  it("⚠️ reprocessar NÃO pede arquivo — a mesma foto serve", async () => {
    // motor_timeout, armazenamento_indisponivel e omr_indisponivel mapeiam
    // para cá: falhou a infra, não a imagem. Pedir foto nova faria o cursinho
    // refotografar à toa.
    const { container } = montar("reprocessar");

    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByRole("button", { name: /tentar/i })).toBeInTheDocument();
  });

  it("⚠️ falar_com_suporte não oferece ação nenhuma", async () => {
    const { container } = montar("falar_com_suporte");

    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it("⚠️ ação que esta versão da tela não conhece não oferece nada", async () => {
    // mesma postura do STATUS_CONHECIDOS do DetalheDoEstudante: o ms pode
    // ganhar uma ação antes do client, e adivinhar qual botão mostrar é
    // afirmar o que não se sabe.
    const { container } = montar("teletransportar_a_folha");

    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it("reprocessar chama o serviço sem arquivo", async () => {
    montar("reprocessar");

    fireEvent.click(screen.getByRole("button", { name: /tentar/i }));

    await waitFor(() =>
      expect(reprocessarCartao).toHaveBeenCalledWith("tok", "h1", undefined),
    );
  });

  it("⚠️ reenviar_foto manda O ARQUIVO ESCOLHIDO ao serviço", async () => {
    // sem isto, um componente que renderiza o input e ignora o `onChange`
    // passa em todo o resto da suíte — e a foto nova nunca sai do navegador.
    const { container } = montar("reenviar_foto");

    escolherArquivo(container);

    await waitFor(() =>
      expect(reprocessarCartao).toHaveBeenCalledWith("tok", "h1", arquivo),
    );
  });

  it("⚠️ a recusa por janela mostra o tempo que falta, não um erro genérico", async () => {
    // um 429 sem número manda a pessoa tentar de novo na hora, e de novo
    reprocessarCartao.mockRejectedValue(
      new Error("aguarde 42s para tentar novamente neste cartão"),
    );
    montar("reprocessar");

    fireEvent.click(screen.getByRole("button", { name: /tentar/i }));

    expect(await screen.findByText(/42s/)).toBeInTheDocument();
  });

  it("⚠️ a recusa da foto errada também passa inteira", async () => {
    reprocessarCartao.mockRejectedValue(
      new Error("a foto enviada é de outro cartão"),
    );
    const { container } = montar("reenviar_foto");

    escolherArquivo(container);

    expect(await screen.findByText(/de outro cartão/i)).toBeInTheDocument();
  });

  it("avisa quem montou depois de reenviar, para a tela recarregar", async () => {
    const onReenviado = vi.fn();
    montar("reprocessar", { onReenviado });

    fireEvent.click(screen.getByRole("button", { name: /tentar/i }));

    await waitFor(() => expect(onReenviado).toHaveBeenCalled());
  });

  it("⚠️ recusado NÃO avisa quem montou — não houve reenvio nenhum", async () => {
    // avisar aqui recarregaria o detalhe por cima da mensagem de recusa, e a
    // pessoa nunca leria o motivo
    reprocessarCartao.mockRejectedValue(new Error("aguarde 42s"));
    const onReenviado = vi.fn();
    montar("reprocessar", { onReenviado });

    fireEvent.click(screen.getByRole("button", { name: /tentar/i }));

    await screen.findByText(/42s/);
    expect(onReenviado).not.toHaveBeenCalled();
  });

  it("⚠️ em voo, a ação fica travada — dois cliques são duas tentativas", async () => {
    // a segunda cairia na janela do rate limit e voltaria como recusa, com a
    // primeira ainda em voo
    let liberar!: () => void;
    reprocessarCartao.mockReturnValue(
      new Promise<void>((r) => {
        liberar = () => r();
      }),
    );
    montar("reprocessar");

    const botao = screen.getByRole("button", { name: /tentar/i });
    fireEvent.click(botao);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: TEXTO_ENVIANDO })).toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: TEXTO_ENVIANDO }));
    expect(reprocessarCartao).toHaveBeenCalledTimes(1);

    liberar();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: TEXTO_REPROCESSAR }),
      ).toBeEnabled(),
    );
  });

  it("⚠️ o campo de arquivo é limpo depois da tentativa", async () => {
    // o browser só emite `change` quando o VALOR muda: um campo que guarda a
    // foto recusada fica mudo se a pessoa escolher a MESMA foto de novo — e é
    // exatamente o que ela faz depois de esperar os 42s da janela.
    reprocessarCartao.mockRejectedValue(new Error("aguarde 42s"));
    const { container } = montar("reenviar_foto");
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    // ⚠️ jsdom não emula o gate do browser: `fireEvent.change` REDEFINE `files`
    // e não toca no valor interno, então `input.value` volta "" e
    // `input.files.length` volta 1 com ou sem a limpeza — nenhum dos dois
    // distingue implementação nenhuma. O que se observa é a ESCRITA, que é
    // justamente o que no browser devolve o campo ao vazio e deixa o próximo
    // `change` acontecer.
    const escritas: string[] = [];
    Object.defineProperty(input, "value", {
      configurable: true,
      get: () => "",
      set: (v: string) => escritas.push(v),
    });

    fireEvent.change(input, { target: { files: [arquivo] } });

    await screen.findByText(/42s/);
    expect(escritas).toContain("");
  });

  it("⚠️ em voo, o campo de arquivo também fica travado", async () => {
    // mesma corrida do botão: duas escolhas no mesmo tick leem o `enviando`
    // velho, e a segunda cai na janela entre tentativas com a primeira ainda
    // em voo.
    reprocessarCartao.mockReturnValue(new Promise<void>(() => {}));
    const { container } = montar("reenviar_foto");

    escolherArquivo(container);
    escolherArquivo(container);

    await waitFor(() =>
      expect(screen.getByText(TEXTO_ENVIANDO)).toBeInTheDocument(),
    );
    expect(reprocessarCartao).toHaveBeenCalledTimes(1);
  });

  it("⚠️ a tela não conhece código de erro nenhum", async () => {
    // o ramo sai do `acaoSugerida` que o ms manda pronto; o código só viaja
    // junto. Dois códigos diferentes com a mesma ação rendem a mesma tela.
    const { container } = render(
      <AcaoDeReenvio
        token="tok"
        historicoId="h1"
        falha={
          {
            codigo: "motor_timeout",
            descricao: "O leitor demorou demais",
            acaoSugerida: "reprocessar",
          } as never
        }
        onReenviado={vi.fn()}
      />,
    );

    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByRole("button", { name: /tentar/i })).toBeInTheDocument();
  });
});
