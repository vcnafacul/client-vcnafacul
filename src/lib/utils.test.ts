import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("mantém passo de texto e cor juntos", () => {
    expect(cn("text-h3", "text-muted-foreground")).toBe("text-h3 text-muted-foreground");
    expect(cn("text-caption text-destructive")).toBe("text-caption text-destructive");
  });

  it("dois tamanhos: vence o último", () => {
    expect(cn("text-h3", "text-h4")).toBe("text-h4");
    expect(cn("text-sm", "text-body")).toBe("text-body");
  });

  it("camadas de z-index conflitam com z-*", () => {
    expect(cn("z-popover", "z-50")).toBe("z-50");
    expect(cn("z-50", "z-overlay")).toBe("z-overlay");
  });

  it("larguras do design system conflitam com max-w-*", () => {
    expect(cn("max-w-form", "max-w-5xl")).toBe("max-w-5xl");
  });

  it("cores semânticas continuam conflitando", () => {
    expect(cn("bg-cta", "bg-primary")).toBe("bg-primary");
    expect(cn("text-foreground", "text-muted-foreground")).toBe("text-muted-foreground");
  });

  it("sombras continuam conflitando entre si", () => {
    expect(cn("shadow-sm", "shadow-lg")).toBe("shadow-lg");
    expect(cn("shadow", "shadow-md")).toBe("shadow-md");
  });

  it("os passos conhecidos batem com tailwind/type-scale.js", () => {
    const src = readFileSync("tailwind/type-scale.js", "utf8");
    const passos = [...src.matchAll(/^\s+"?([a-z0-9-]+)"?: \[\[/gm)].map((m) => m[1]);
    expect(passos).toHaveLength(14);
    for (const p of passos) {
      expect(cn(`text-${p}`, "text-destructive")).toBe(`text-${p} text-destructive`);
    }
  });
});
