// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import resolveConfig from "tailwindcss/resolveConfig";
// @ts-expect-error tailwind.config.js não tem declaração de tipos
import config from "../../tailwind.config.js";

// Os plugins não influenciam o tema; o ESM de tailwind-scrollbar-hide não carrega no vitest.
vi.mock("tailwind-scrollbar-hide", () => ({ default: () => {} }));
vi.mock("@tailwindcss/typography", () => ({ default: () => {} }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const theme = resolveConfig(config as any).theme as any;

describe("tailwind.config.js", () => {
  it.each([
    ["red", "#F43535"],
    ["orange", "#FF7600"],
    ["yellow", "#FFE53C"],
    ["green", "#37D6B5"],
    ["pink", "#DA005A"],
    ["purple", "#8A2BE2"],
  ])("mantém a escala padrão de %s e o DEFAULT da marca", (hue, hex) => {
    expect(theme.colors[hue][500]).toBeDefined();
    expect(theme.colors[hue].DEFAULT).toBe(hex);
  });

  it("mantém animate-spin e animate-pulse", () => {
    expect(theme.animation.spin).toBeDefined();
    expect(theme.animation.pulse).toBeDefined();
  });

  it("mantém bg-gradient-*", () => {
    expect(theme.backgroundImage["gradient-to-r"]).toBeDefined();
  });
});
