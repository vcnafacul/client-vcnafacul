import { describe, expect, it } from "vitest";
import { validarQuestaoNova } from "./validarQuestaoNova";

const completa = {
  prova: "p1",
  numero: 3,
  enemArea: "Matemática",
  materia: "m1",
  frente1: "f1",
  textoQuestao: "enunciado",
  textoAlternativaA: "a",
  textoAlternativaB: "b",
  textoAlternativaC: "c",
  textoAlternativaD: "d",
  textoAlternativaE: "e",
  alternativa: "A",
} as any;

describe("validarQuestaoNova", () => {
  it("completa: sem erro e sem resumo", () => {
    expect(validarQuestaoNova(completa)).toEqual({ erros: {}, resumo: null });
  });

  it("⚠️ sem prova: passa — prova é opcional (area-enem 03)", () => {
    expect(
      validarQuestaoNova({ ...completa, prova: "", numero: null }),
    ).toEqual({ erros: {}, resumo: null });
  });

  it("⚠️ COM prova e sem número: exige o número", () => {
    const { erros, resumo } = validarQuestaoNova({ ...completa, numero: null });

    expect(Object.keys(erros)).toEqual(["numero"]);
    expect(resumo).toBe("Falta preencher — Classificação: Número");
  });

  it("agrupa por aba, na ordem das abas", () => {
    const { resumo } = validarQuestaoNova({
      ...completa,
      materia: "",
      textoAlternativaC: "  ",
      alternativa: "",
    });

    expect(resumo).toBe(
      "Falta preencher — Classificação: Disciplina · Alternativas: Alternativa C, Resposta correta",
    );
  });

  it("mantém as mensagens por campo que as abas já mostram", () => {
    const { erros } = validarQuestaoNova({ ...completa, textoQuestao: "" });

    expect(erros.textoQuestao).toBe("Texto da questão é obrigatório");
  });
});
