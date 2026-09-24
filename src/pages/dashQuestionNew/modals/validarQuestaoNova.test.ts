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

  it("⚠️ o caso do relato: sem prova e sem número, o resumo diz onde", () => {
    /*
      Tudo preenchido menos Prova e Número, e o clique na aba Alternativas:
      antes, nada acontecia. O resumo aponta a aba.
    */
    const { erros, resumo } = validarQuestaoNova({
      ...completa,
      prova: "",
      numero: null,
    });

    expect(Object.keys(erros)).toEqual(["prova", "numero"]);
    expect(resumo).toBe("Falta preencher — Classificação: Prova, Número");
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
