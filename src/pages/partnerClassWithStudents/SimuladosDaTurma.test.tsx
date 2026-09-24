import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ROTULO_SELETOR,
  SEM_NOME,
  SimuladosDaTurma,
  TEXTO_ERRO,
  TEXTO_VAZIO,
} from "./SimuladosDaTurma";

/* -------------------------------------------------------------------------- *
 * ⚠️ **Este arquivo foi reescrito no card 19.**
 *
 * Os 9 testes anteriores cobriam a TABELA DE SIMULADOS que esta aba mostrava
 * (colunas, ordenação, chave de linha, clique que navegava para o relatório).
 * Essa tabela saiu: a aba passou a mostrar o relatório direto, com um seletor.
 * Eles não voltam porque o comportamento que provavam deixou de existir.
 *
 * O que transferiu está preservado abaixo: o simulado sem nome que continua na
 * lista, o vazio explicativo, e o recorte da turma chegando ao conteúdo.
 * -------------------------------------------------------------------------- */

const buscarSimuladosComCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao,
}));

/** O miolo do relatório é exercitado pelos testes DELE; aqui vira dublê. */
const conteudoProps = vi.hoisted(() => vi.fn());
vi.mock("@/pages/relatorioSimulado/RelatorioDoSimuladoConteudo", () => ({
  RelatorioDoSimuladoConteudo: (p: Record<string, unknown>) => {
    conteudoProps(p);
    return <div data-testid="conteudo-do-relatorio" />;
  },
}));

const simulado = (over = {}) => ({
  simuladoId: "sim-1",
  nome: "ENEM 2024 — 1º dia",
  cartoes: 12,
  comLeituraConcluida: 9,
  ultimoEnvio: "2026-05-02T00:00:00.000Z",
  ...over,
});

const montar = () =>
  render(
    <MemoryRouter>
      <SimuladosDaTurma token="tok" turmaId="t-1" />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  buscarSimuladosComCartao.mockResolvedValue({ simulados: [simulado()] });
});

describe("SimuladosDaTurma — a aba mostra o relatório", () => {
  it("⚠️ NÃO mostra mais uma tabela de simulados", async () => {
    // Era um intermediário: uma tabela cujas colunas ninguém usava para
    // decidir, e que cobrava um clique a mais para chegar ao que interessa.
    montar();

    expect(await screen.findByTestId("conteudo-do-relatorio")).toBeInTheDocument();
    expect(document.querySelector("table")).toBeNull();
  });

  it("⚠️ passa o turmaId ao conteúdo — o recorte é a turma aberta", async () => {
    montar();

    await waitFor(() => expect(conteudoProps).toHaveBeenCalled());
    expect(conteudoProps.mock.calls.at(-1)![0]).toMatchObject({
      turmaId: "t-1",
      token: "tok",
      simuladoId: "sim-1",
    });
  });

  it("⚠️ abre no simulado MAIS RECENTE, sem cobrar um clique", async () => {
    // A rota já devolve ordenado por último envio, então o primeiro é o mais
    // recente — quase sempre o que o coordenador veio ver.
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        simulado({ simuladoId: "recente", nome: "Mais recente" }),
        simulado({ simuladoId: "antigo", nome: "Mais antigo" }),
      ],
    });
    montar();

    await waitFor(() => expect(conteudoProps).toHaveBeenCalled());
    expect(conteudoProps.mock.calls.at(-1)![0]).toMatchObject({
      simuladoId: "recente",
    });
  });

  it("busca os simulados da turma, não do cursinho inteiro", async () => {
    montar();

    await waitFor(() =>
      expect(buscarSimuladosComCartao).toHaveBeenCalledWith("tok", "t-1"),
    );
  });
});

describe("SimuladosDaTurma — o seletor", () => {
  it("lista os simulados com cartão da turma", async () => {
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        simulado({ simuladoId: "a", nome: "Simulado A" }),
        simulado({ simuladoId: "b", nome: "Simulado B" }),
      ],
    });
    montar();

    await screen.findByTestId("seletor-de-simulado");
    expect(screen.getByText("Simulado A")).toBeInTheDocument();
    expect(screen.getByText("Simulado B")).toBeInTheDocument();
    expect(screen.getByText(ROTULO_SELETOR)).toBeInTheDocument();
  });

  it("⚠️ trocar de simulado troca o conteúdo", async () => {
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        simulado({ simuladoId: "a", nome: "Simulado A" }),
        simulado({ simuladoId: "b", nome: "Simulado B" }),
      ],
    });
    montar();
    const seletor = await screen.findByTestId("seletor-de-simulado");

    fireEvent.change(seletor, { target: { value: "b" } });

    await waitFor(() =>
      expect(conteudoProps.mock.calls.at(-1)![0]).toMatchObject({
        simuladoId: "b",
      }),
    );
  });

  it("⚠️ simulado sem nome CONTINUA na lista, rotulado", async () => {
    // Preservado do arquivo anterior: o documento sumiu, mas os cartões
    // continuam existindo — esconder seria o oposto do que o relatório serve
    // para fazer.
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [simulado({ simuladoId: "sem", nome: null })],
    });
    montar();

    await screen.findByTestId("seletor-de-simulado");
    expect(screen.getByText(SEM_NOME)).toBeInTheDocument();
  });
});

describe("SimuladosDaTurma — vazio e erro", () => {
  it("⚠️ o vazio fala de ESTUDANTES, não de simulados", async () => {
    // A tela deixou de listar simulados; "nenhum simulado desta turma teve
    // cartão enviado" descrevia a tabela que não está mais ali.
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [] });
    montar();

    expect(await screen.findByText(TEXTO_VAZIO)).toBeInTheDocument();
    expect(screen.queryByTestId("conteudo-do-relatorio")).not.toBeInTheDocument();
  });

  it("erro é recuperável — tentar de novo rebusca", async () => {
    buscarSimuladosComCartao.mockRejectedValueOnce(new Error("caiu"));
    montar();

    fireEvent.click(await screen.findByText(/tentar novamente/i));

    await waitFor(() =>
      expect(buscarSimuladosComCartao).toHaveBeenCalledTimes(2),
    );
  });

  it("erro mostra mensagem, não tela em branco", async () => {
    buscarSimuladosComCartao.mockRejectedValue(new Error("caiu"));
    montar();

    expect(await screen.findByText(TEXTO_ERRO)).toBeInTheDocument();
  });
});

describe("SimuladosDaTurma — identificação (card 18)", () => {
  it("⚠️ a aba NÃO repete o nome do simulado que o seletor já mostra", async () => {
    // O card 18 é explícito: na aba, a turma é a tela inteira e o `<select>`
    // logo acima já traz o nome. Repetir os dois seria ruído — fica só a linha
    // de contexto.
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        { simuladoId: "s1", nome: "ENEM 2024", cartoes: 2, comLeituraConcluida: 2, ultimoEnvio: null },
      ],
    });
    render(<SimuladosDaTurma turmaId="t-1" token="tok" />);

    await screen.findByTestId("seletor-de-simulado");

    // nenhum <h1> com o nome: ele existe só dentro do <option>
    expect(screen.queryByRole("heading", { name: "ENEM 2024" })).not.toBeInTheDocument();
  });
});

describe("SimuladosDaTurma — comparação entre aplicações (card 31)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("⚠️ com UMA aplicação só, não há o que comparar", async () => {
    // Um seletor que oferece a mesma prova dos dois lados é um controle que só
    // sabe não fazer nada.
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        {
          simuladoId: "s1",
          nome: "Única",
          cartoes: 1,
          comLeituraConcluida: 1,
          ultimoEnvio: null,
        },
      ],
    });

    const { container } = montar();

    await screen.findByTestId("seletor-de-simulado");
    expect(container.querySelector("[data-toggle-comparacao]")).toBeNull();
  });

  it("⚠️ a comparação fica FECHADA por padrão", async () => {
    /*
      Ela dispara DUAS chamadas ao relatório, e a maioria das visitas quer ver
      uma aplicação — abrir sempre dobraria o custo da aba para quem nem vai
      olhar.
    */
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        {
          simuladoId: "a",
          nome: "A",
          cartoes: 1,
          comLeituraConcluida: 1,
          ultimoEnvio: null,
        },
        {
          simuladoId: "b",
          nome: "B",
          cartoes: 1,
          comLeituraConcluida: 1,
          ultimoEnvio: null,
        },
      ],
    });

    const { container } = montar();

    await screen.findByTestId("seletor-de-simulado");
    expect(container.querySelector("[data-toggle-comparacao]")).toBeTruthy();
    expect(container.querySelector("[data-comparacao]")).toBeNull();
  });

  it("o toggle abre a comparação", async () => {
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [
        {
          simuladoId: "a",
          nome: "A",
          cartoes: 1,
          comLeituraConcluida: 1,
          ultimoEnvio: null,
        },
        {
          simuladoId: "b",
          nome: "B",
          cartoes: 1,
          comLeituraConcluida: 1,
          ultimoEnvio: null,
        },
      ],
    });

    const { container } = montar();
    await screen.findByTestId("seletor-de-simulado");

    fireEvent.click(container.querySelector("[data-toggle-comparacao]")!);

    await waitFor(() =>
      expect(container.querySelector("[data-comparacao]")).toBeTruthy(),
    );
  });
});
