import { describe, expect, it } from "vitest";
import { payloadDaClassificacao } from "./payloadDaClassificacao";

const form = {
  prova: "p1",
  numero: 7,
  enemArea: "Matemática",
  materia: "m1",
  frente1: "f1",
  frente2: "",
  frente3: "",
  provaClassification: true,
  subjectClassification: true,
  reported: false,
} as any;

describe("payloadDaClassificacao (area-enem 02)", () => {
  it("com vínculo: manda a prova e o número editados", () => {
    expect(payloadDaClassificacao("q1", form, true)).toMatchObject({
      _id: "q1",
      prova: "p1",
      numero: 7,
      enemArea: "Matemática",
    });
  });

  it("⚠️ sem vínculo: NÃO manda prova nem número — o ms só salva", () => {
    const p = payloadDaClassificacao("q1", { ...form, prova: "" }, false);

    expect("prova" in p).toBe(false);
    expect("numero" in p).toBe(false);
    expect(p.enemArea).toBe("Matemática");
  });

  it("frente2/3 vazias viram ausentes", () => {
    const p = payloadDaClassificacao("q1", form, true);

    expect(p.frente2).toBeUndefined();
    expect(p.frente3).toBeUndefined();
  });
});
