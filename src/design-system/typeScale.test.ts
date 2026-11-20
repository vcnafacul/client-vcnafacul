// @vitest-environment node
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { beforeAll, describe, expect, it, vi } from "vitest";
// @ts-expect-error tailwind.config.js não tem declaração de tipos
import config from "../../tailwind.config.js";

vi.mock("tailwind-scrollbar-hide", () => ({ default: () => {} }));
vi.mock("@tailwindcss/typography", () => ({ default: () => {} }));

let css = "";

beforeAll(async () => {
  const result = await postcss([
    tailwindcss({
      ...(config as object),
      content: [{ raw: '<h1 class="text-h1 text-hero">' }],
    } as Parameters<typeof tailwindcss>[0]),
  ]).process("@tailwind utilities;", { from: undefined });
  css = result.css.replace(/\s+/g, " ");
});

describe("escala de texto", () => {
  it("text-h1 tem tamanho e line-height mobile e sobe a 30px em ≥768", () => {
    expect(css).toMatch(/\.text-h1 ?\{ ?font-size: 24px; ?line-height: 1\.2;? ?\}/);
    expect(css).toMatch(
      /@media \(min-width: 768px\) ?\{ ?\.text-h1 ?\{ ?font-size: 30px;? ?\}/,
    );
  });

  it("o peso sai em :where(), com especificidade zero", () => {
    expect(css).toMatch(/:where\(\.text-h1\) ?\{ ?font-weight: 700;? ?\}/);
  });

  it("text-hero tem 48, 72 (≥1200) e 96 (≥1565)", () => {
    expect(css).toMatch(/\.text-hero ?\{ ?font-size: 48px;/);
    expect(css).toMatch(
      /@media \(min-width: 1200px\) ?\{ ?\.text-hero ?\{ ?font-size: 72px;? ?\}/,
    );
    expect(css).toMatch(
      /@media \(min-width: 1565px\) ?\{ ?\.text-hero ?\{ ?font-size: 96px;? ?\}/,
    );
  });
});
