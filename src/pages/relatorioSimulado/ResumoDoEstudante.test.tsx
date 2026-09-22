import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  LinhaDoRelatorio,
  MediaPorMateria,
  RespostaDoEstudante,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { ResumoDoEstudante } from "./ResumoDoEstudante";

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Pedro Almeida",
  matricula: "2024-0142",
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: "completed",
  acertos: 45,
  aproveitamentoGeral: 0.5,
  aproveitamentoPorMateria: [
    {
      id: "mat",
      nome: "Matemática",
      aproveitamento: 0.3,
      frentes: [
        { id: "arit", nome: "Aritmética", aproveitamento: 0.25 },
        { id: "geo", nome: "Geometria", aproveitamento: 0.4 },
      ],
    },
    { id: "hum", nome: "Humanas", aproveitamento: 0.82, frentes: [] },
  ],
  ...over,
});

const MATERIAS_DA_TURMA: MediaPorMateria[] = [
  { id: "mat", nome: "Matemática", media: 0.52, base: 27 },
  { id: "hum", nome: "Humanas", media: 0.7, base: 27 },
];

const resposta = (
  resultado: RespostaDoEstudante["resultado"],
  numero: number,
): RespostaDoEstudante => ({
  numero,
  questaoId: `q${numero}`,
  alternativaCorreta: "A",
  resultado,
});

const montar = (over: Partial<Parameters<typeof ResumoDoEstudante>[0]> = {}) =>
  render(
    <ResumoDoEstudante
      linha={linha()}
      totalDeQuestoes={90}
      mediaDoRecorte={0.36}
      materiasDaTurma={MATERIAS_DA_TURMA}
      respostas={[]}
      {...over}
    />,
  );

describe("ResumoDoEstudante (card 10)", () => {
  it("mostra acertos, percentual e o desvio da turma", () => {
    montar();

    expect(screen.getByText("45/90 acertos")).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    // 0,50 − 0,36 = +14 p.p.
    expect(screen.getByText(/\+14 p\.p\. que a turma/)).toBeInTheDocument();
  });

  it("⚠️ desvio em p.p., e NÃO posição na turma", () => {
    // O mockup do card 10 mostra "12º de 27", mas a decisão do card 08 — tomada
    // depois dele — foi não criar ranking nominal: esta tela é a base do que um
    // dia vira tela do aluno.
    const { container } = montar();

    expect(container.querySelector("[data-desvio]")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\dº/);
  });

  it("⚠️ a média da TURMA aparece ao lado de cada matéria, sempre", () => {
    // Mesmo princípio do `formatarDificuldade`: "30% em Matemática" só vira
    // informação contra o "52%" da turma. Sem isso o bloco é bonito e não
    // decide nada.
    const { container } = montar();

    expect(container.querySelector('[data-turma="Matemática"]')).toHaveTextContent(
      "turma: 52%",
    );
    expect(container.querySelector('[data-turma="Humanas"]')).toHaveTextContent(
      "turma: 70%",
    );
  });

  it("⚠️ matéria que a turma não tem mostra travessão, não um número inventado", () => {
    const { container } = montar({ materiasDaTurma: [] });

    expect(container.querySelector('[data-turma="Matemática"]')).toHaveTextContent(
      "turma: —",
    );
  });

  describe("frentes", () => {
    it("⚠️ fechadas por padrão", () => {
      // 15 frentes abertas de largada recriam o problema que o bloco veio
      // resolver: detalhe onde se queria diagnóstico.
      const { container } = montar();

      expect(container.querySelector('[data-frentes="Matemática"]')).toBeNull();
    });

    it("expandem por matéria, uma de cada vez", () => {
      const { container } = montar();

      fireEvent.click(screen.getByText(/Matemática/));

      expect(
        container.querySelector('[data-frentes="Matemática"]'),
      ).toHaveTextContent("Aritmética");
      // a outra continua fechada
      expect(container.querySelector('[data-frentes="Humanas"]')).toBeNull();
    });

    it("⚠️ matéria SEM frentes não vira botão que não faz nada", () => {
      const { container } = montar();

      expect(container.querySelector('[data-materia="Humanas"]')).toBeDisabled();
      expect(
        container.querySelector('[data-materia="Matemática"]'),
      ).not.toBeDisabled();
    });

    it("o `aria-expanded` acompanha, e só existe onde há o que expandir", () => {
      const { container } = montar();
      const mat = container.querySelector('[data-materia="Matemática"]')!;

      expect(mat).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(mat);
      expect(mat).toHaveAttribute("aria-expanded", "true");
      expect(
        container.querySelector('[data-materia="Humanas"]'),
      ).not.toHaveAttribute("aria-expanded");
    });
  });

  describe("sem leitura", () => {
    it("⚠️ conta as questões não lidas do cartão", () => {
      // O ÚNICO número calculado no bloco, e pode ser: não existe em lugar
      // nenhum do contrato para discordar dele. É o que explica um
      // aproveitamento baixo sem que o aluno tenha errado.
      const { container } = montar({
        respostas: [
          resposta("acerto", 1),
          resposta("sem_leitura", 2),
          resposta("erro", 3),
          resposta("sem_leitura", 4),
          resposta("sem_leitura", 5),
        ],
      });

      expect(container.querySelector("[data-sem-leitura]")).toHaveTextContent(
        "3 questões sem leitura neste cartão",
      );
    });

    it("uma questão só sai no singular", () => {
      const { container } = montar({ respostas: [resposta("sem_leitura", 1)] });

      expect(container.querySelector("[data-sem-leitura]")).toHaveTextContent(
        "1 questão sem leitura neste cartão",
      );
    });

    it("⚠️ nenhuma não vira '0 questões sem leitura'", () => {
      // Uma linha dizendo zero é ruído: a ausência do aviso já é a informação.
      const { container } = montar({ respostas: [resposta("acerto", 1)] });

      expect(container.querySelector("[data-sem-leitura]")).toBeNull();
    });

    it("⚠️ diz que elas CONTAM COMO ERRO na nota acima (card 13)", () => {
      /*
        A contagem existia e era muda sobre a consequência. `criaAproveitamento`
        divide por TODAS as questões do simulado, então a não lida entra no
        denominador e não no numerador.

        Sem esta frase o modal mostra "45 acertos · 50%" ao lado de "3 questões
        sem leitura" e deixa supor que os dois números são independentes. São o
        mesmo número: os 50% já punem as três.
      */
      const { container } = montar({
        respostas: [resposta("sem_leitura", 1), resposta("sem_leitura", 2)],
      });

      expect(container.querySelector("[data-sem-leitura]")).toHaveTextContent(
        "elas contam como erro no aproveitamento acima",
      );
    });

    it("com uma só, a frase concorda no singular", () => {
      const { container } = montar({ respostas: [resposta("sem_leitura", 1)] });

      expect(container.querySelector("[data-sem-leitura]")).toHaveTextContent(
        "ela conta como erro no aproveitamento acima",
      );
    });
  });

  it("⚠️ sem `acertos` no contrato, o bloco mostra só o percentual", () => {
    // Histórico anterior ao card 08. Derivar de `0,5 × 90` daria um número que
    // o aluno confere contra o cartão e pode não bater.
    montar({ linha: linha({ acertos: undefined }) });

    expect(screen.queryByText(/acertos/)).not.toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it("linha sem matérias não desenha barra nenhuma", () => {
    const { container } = montar({
      linha: linha({ aproveitamentoPorMateria: undefined }),
    });

    expect(container.querySelector("[data-materia]")).toBeNull();
    expect(screen.getByText("45/90 acertos")).toBeInTheDocument();
  });
});
