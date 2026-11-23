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
  it("mantém as escalas padrão de cor, sem o DEFAULT da marca antiga", () => {
    for (const hue of ["red", "orange", "yellow", "green", "pink", "purple"]) {
      expect(theme.colors[hue][500]).toBeDefined();
      expect(theme.colors[hue].DEFAULT).toBeUndefined();
    }
  });

  it("não tem mais os nomes de cor legados", () => {
    for (const nome of [
      "marine",
      "grey",
      "darkGrey",
      "lightGray",
      "gray2",
      "backgroundGrey",
      "backgroundMarine",
      "darkOrange",
      "lightYellow",
      "lightGreen",
      "green2",
      "green3",
      "darkGreen",
      "redError",
      "blueGeo",
      "logoCursinho",
      "logoEstudos",
    ]) {
      expect(theme.colors[nome], nome).toBeUndefined();
    }
    expect(theme.colors.white).toBe("#FFFFFF");
    expect(theme.colors.black).toBe("#000000");
  });

  it("não tem o fontSize padrão do Tailwind (só a escala text-*)", () => {
    expect(theme.fontSize.sm).toBeUndefined();
    expect(theme.fontSize.xs).toBeUndefined();
    expect(theme.fontSize["2xl"]).toBeUndefined();
  });

  it("mantém animate-spin e animate-pulse", () => {
    expect(theme.animation.spin).toBeDefined();
    expect(theme.animation.pulse).toBeDefined();
  });

  it("mantém bg-gradient-*", () => {
    expect(theme.backgroundImage["gradient-to-r"]).toBeDefined();
  });

  it("expõe os tokens semânticos", () => {
    expect(theme.colors.cta.DEFAULT).toBe("hsl(var(--cta) / <alpha-value>)");
    expect(theme.colors.muted.foreground).toBe(
      "hsl(var(--muted-foreground) / <alpha-value>)",
    );
    expect(theme.colors.success.muted).toBe(
      "hsl(var(--success-muted) / <alpha-value>)",
    );
    expect(theme.zIndex.popover).toBe("50");
    expect(theme.maxWidth.form).toBe("560px");
    expect(theme.borderRadius.lg).toBe("var(--radius)");
  });
});
