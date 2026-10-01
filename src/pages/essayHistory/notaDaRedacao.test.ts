import { describe, expect, it } from "vitest";
import { Essay } from "@/dtos/essay";
import { notaDaRedacao } from "./notaDaRedacao";

const redacao = (
  reviews: { reviewType: "AI" | "HUMAN"; totalScore: number }[],
) => ({ reviews }) as unknown as Essay;

describe("notaDaRedacao", () => {
  it("prefere a correção humana", () => {
    expect(
      notaDaRedacao(
        redacao([
          { reviewType: "AI", totalScore: 600 },
          { reviewType: "HUMAN", totalScore: 760 },
        ]),
      ),
    ).toBe(760);
  });

  it("com a IA desligada, usa a humana (antes aparecia '-')", () => {
    expect(
      notaDaRedacao(redacao([{ reviewType: "HUMAN", totalScore: 800 }])),
    ).toBe(800);
  });

  it("só IA, usa a da IA; sem correção, null", () => {
    expect(
      notaDaRedacao(redacao([{ reviewType: "AI", totalScore: 540 }])),
    ).toBe(540);
    expect(notaDaRedacao(redacao([]))).toBeNull();
  });
});
