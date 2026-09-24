import type { CreateQuestion } from "@/dtos/question/updateQuestion";

type Aba = "Classificação" | "Enunciado" | "Alternativas";

/** Cada campo obrigatório do cadastro: onde ele mora e o que dizer. */
const OBRIGATORIOS: {
  campo: keyof CreateQuestion;
  rotulo: string;
  aba: Aba;
  mensagem: string;
  falta: (f: Partial<CreateQuestion>) => boolean;
}[] = [
  {
    campo: "prova",
    rotulo: "Prova",
    aba: "Classificação",
    mensagem: "Prova é obrigatória",
    falta: (f) => !f.prova,
  },
  {
    campo: "numero",
    rotulo: "Número",
    aba: "Classificação",
    mensagem: "Número deve ser maior que 0",
    falta: (f) => !f.numero || f.numero < 1,
  },
  {
    campo: "enemArea",
    rotulo: "Área ENEM",
    aba: "Classificação",
    mensagem: "Área ENEM é obrigatória",
    falta: (f) => !f.enemArea,
  },
  {
    campo: "materia",
    rotulo: "Disciplina",
    aba: "Classificação",
    mensagem: "Matéria é obrigatória",
    falta: (f) => !f.materia,
  },
  {
    campo: "frente1",
    rotulo: "Frente principal",
    aba: "Classificação",
    mensagem: "Frente principal é obrigatória",
    falta: (f) => !f.frente1,
  },
  {
    campo: "textoQuestao",
    rotulo: "Enunciado",
    aba: "Enunciado",
    mensagem: "Texto da questão é obrigatório",
    falta: (f) => !f.textoQuestao?.trim(),
  },
  ...(["A", "B", "C", "D", "E"] as const).map((l) => ({
    campo: `textoAlternativa${l}` as keyof CreateQuestion,
    rotulo: `Alternativa ${l}`,
    aba: "Alternativas" as Aba,
    mensagem: `Alternativa ${l} é obrigatória`,
    falta: (f: Partial<CreateQuestion>) =>
      !(
        f[`textoAlternativa${l}` as keyof CreateQuestion] as string | undefined
      )?.trim(),
  })),
  {
    campo: "alternativa",
    rotulo: "Resposta correta",
    aba: "Alternativas",
    mensagem: "Resposta correta é obrigatória",
    falta: (f) => !f.alternativa,
  },
];

/**
 * Valida o cadastro de questão — os erros por campo, e um resumo por aba.
 *
 * ⚠️ **O resumo existe porque a falha era SILENCIOSA.** O modal tem três abas
 * e cada erro só aparece na sua: quem clicava em "Criar Questão" na aba
 * Alternativas sem ter escolhido a prova não via nada acontecer — nenhum
 * fetch, nenhum aviso. Ficou fácil de acontecer quando a área deixou de exigir
 * prova (card 02 de `area-enem-da-questao`): antes, sem prova não se chegava
 * a preencher a classificação.
 */
export function validarQuestaoNova(formData: Partial<CreateQuestion>): {
  erros: Record<string, string>;
  resumo: string | null;
} {
  const faltando = OBRIGATORIOS.filter((o) => o.falta(formData));
  const erros = Object.fromEntries(faltando.map((o) => [o.campo, o.mensagem]));
  if (faltando.length === 0) return { erros, resumo: null };

  const porAba = new Map<Aba, string[]>();
  for (const o of faltando) {
    porAba.set(o.aba, [...(porAba.get(o.aba) ?? []), o.rotulo]);
  }
  const resumo =
    "Falta preencher — " +
    [...porAba]
      .map(([aba, campos]) => `${aba}: ${campos.join(", ")}`)
      .join(" · ");
  return { erros, resumo };
}
