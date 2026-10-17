import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionBoxStatus } from "@/enums/simulado/questionBoxStatus";
import QuestionBox from "@/components/atoms/questionBox";
import { categoriaDoHistorico } from "@/utils/categoriaDoHistorico";
import { avisoDoResultado } from "./textos";
import { AvisoDoResultado } from "./AvisoDoResultado";
import { PorqueDaAnulada } from "./PorqueDaAnulada";

describe("resultado do aluno com anulada (042/16)", () => {
  it("divergente (cartão ainda não recalculado): 'sua nota será atualizada'", () => {
    expect(avisoDoResultado({ divergente: true, anuladasAgora: [45] })).toEqual({
      tipo: "divergente",
      texto: "A questão 45 foi anulada. Sua nota será atualizada quando o cursinho recalcular os resultados.",
    });
  });

  it("recalculado: 'Nota atualizada em 18/10: questão 45 anulada'", () => {
    expect(
      avisoDoResultado({ recalculadoEm: "2026-10-18T15:00:00Z", numerosAnulados: [45], anuladasAgora: [45] }),
    ).toEqual({ tipo: "recalculado", texto: "Nota atualizada em 18/10: questão 45 anulada." });
  });

  it("anulada desde o processamento: 'fora da nota'; sem anulada: nada", () => {
    expect(avisoDoResultado({ numerosAnulados: [3, 45], anuladasAgora: [3, 45] })!.texto).toBe(
      "2 questões anuladas (3, 45): fora da nota.",
    );
    expect(avisoDoResultado({ anuladasAgora: [] })).toBeNull();
    const { container } = render(<AvisoDoResultado anuladasAgora={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("⚠️ 'Completo' contra o total considerado: 89 de 89 é completo", () => {
    const h = { simulado: { categoria: { nome: "ENEM", quantidadeTotalQuestao: 90 } }, totalConsiderado: 89 } as never;
    expect(categoriaDoHistorico(h).totalQuestoes).toBe(89);
    expect(
      categoriaDoHistorico({ simulado: { categoria: { nome: "ENEM", quantidadeTotalQuestao: 90 } } } as never).totalQuestoes,
    ).toBe(90);
  });

  it("no resultado a anulada abre (o aluno lê o porquê); no simulado, não", () => {
    const abrir = vi.fn();
    const { rerender } = render(
      <QuestionBox number={45} status={QuestionBoxStatus.anulada} abreQuandoAnulada onClick={abrir} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Questão 45/ }));
    expect(abrir).toHaveBeenCalledTimes(1);
    rerender(<QuestionBox number={45} status={QuestionBoxStatus.anulada} onClick={abrir} />);
    fireEvent.click(screen.getByRole("img", { name: /Questão 45/ }));
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  it("ao abrir: motivo, justificativa e 'fora da análise'", () => {
    render(<PorqueDaAnulada anulacao={{ motivo: "sem_alternativa_correta", justificativa: "Gabarito errado." }} />);
    const t = screen.getByTestId("porque-da-anulada").textContent!;
    expect(t).toContain("Questão anulada: Sem alternativa correta");
    expect(t).toContain("Gabarito errado.");
    expect(t).toContain("Fora da análise");
  });
});
