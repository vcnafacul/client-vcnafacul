// @vitest-environment node
// Camada expressiva da home (tickets/059 §7.2 item 9): a home usa os tokens e os temas
// `[data-theme]`, sem as variáveis `--section-*` nem a classe `home-section__eyebrow`.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { arquivosDe } from "./guard/scan";

const fontes = [
  ...arquivosDe("src/pages/homeV2"),
  ...arquivosDe("src/pages/quemSomos"),
  "src/components/templates/homeSection/Section.tsx",
  "src/components/templates/homeSection/Section.types.ts",
];

describe("camada expressiva da home", () => {
  it.each(["--section-", "home-section__eyebrow"])("nenhum arquivo da home contém %s", (proibido) => {
    const achados = fontes.filter((f) => readFileSync(f, "utf-8").includes(proibido));
    expect(achados).toEqual([]);
  });

  it("sectionThemes.css foi removido e não é mais importado", () => {
    expect(existsSync("src/styles/sectionThemes.css")).toBe(false);
    expect(readFileSync("src/main.tsx", "utf-8")).not.toContain("sectionThemes");
  });

  it("SectionTheme não tem mais pink nem green", () => {
    const tipos = readFileSync("src/components/templates/homeSection/Section.types.ts", "utf-8");
    expect(tipos).not.toMatch(/"pink"|"green"/);
  });

  it("a home tem uma única ação cta: o pré-cadastro do hero", () => {
    const comCta = [...fontes, "src/components/organisms/mapBoxInfo/mapBoxInfoGeo.tsx"].filter((f) =>
      /variant=["']cta["']|bg-cta/.test(readFileSync(f, "utf-8")),
    );
    expect(comCta).toEqual(["src/pages/homeV2/sections/HeroSection/HeroTriptych.tsx"]);
  });

  it("eyebrows em caixa alta usam text-overline, não uppercase + tracking-widest à mão", () => {
    const achados = fontes.filter((f) => /tracking-widest|(?<![\w-])uppercase(?![\w-])/.test(readFileSync(f, "utf-8")));
    expect(achados).toEqual([]);
  });
});
