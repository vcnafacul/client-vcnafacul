// @vitest-environment node
import { describe, expect, it } from "vitest";
import { rules } from "./rules";

function regra(id: string) {
  const r = rules.find((x) => x.id === id);
  if (!r) throw new Error(`regra ${id} não existe`);
  return r;
}

describe("regras do guard", () => {
  it("expõe os 10 ids da §5.2", () => {
    expect(rules.map((r) => r.id)).toEqual([
      "legacy-color",
      "legacy-size",
      "arbitrary-spacing",
      "flagged-elevation",
      "hero-outside-home",
      "banned-import",
      "frozen-folder",
      "missing-stories",
      "ds-review-marker",
      "ui-semantic-only",
    ]);
  });

  it("legacy-color", () => {
    const r = regra("legacy-color");
    const f = "src/x.tsx";
    expect(r.match('<p className="text-marine">', f)).toBe(1);
    expect(r.match('`${a ? "bg-gray-100" : ""}`', f)).toBe(1);
    expect(r.match('<p className="text-white">', f)).toBe(0);
    expect(r.match('<p className="bg-background border-border text-muted-foreground">', f)).toBe(0);
    expect(r.match('<p className="hover:bg-gray-100 bg-orange/10 border-[#fff]">', f)).toBe(3);
    expect(r.match('<p className="text-transparent bg-current">', f)).toBe(0);
  });

  it("legacy-size", () => {
    const r = regra("legacy-size");
    expect(r.match('className="text-xs md:text-[13px] font-light"', "src/x.tsx")).toBe(3);
    expect(r.match('className="text-body font-semibold text-foreground"', "src/x.tsx")).toBe(0);
  });

  it("arbitrary-spacing", () => {
    const r = regra("arbitrary-spacing");
    expect(r.match('className="p-[13px] -mt-[2px] gap-x-[3px] z-[99] p-4"', "src/x.tsx")).toBe(4);
  });

  it("flagged-elevation", () => {
    const r = regra("flagged-elevation");
    expect(r.match('className="shadow-xl rounded-2xl"', "src/components/x.tsx")).toBe(2);
    expect(r.match('className="shadow-xl rounded-2xl"', "src/pages/homeV2/x.tsx")).toBe(1);
    expect(r.match('className="rounded-3xl"', "src/pages/quemSomos/x.tsx")).toBe(0);
    expect(r.match('className="shadow-md rounded-lg"', "src/x.tsx")).toBe(0);
  });

  it("hero-outside-home", () => {
    const r = regra("hero-outside-home");
    expect(r.match('className="text-hero"', "src/pages/outra/x.tsx")).toBe(1);
    expect(r.match('className="text-hero"', "src/pages/homeV2/x.tsx")).toBe(0);
  });

  it("banned-import", () => {
    const r = regra("banned-import");
    expect(r.match('import { Button } from "@mui/material"', "src/x.tsx")).toBe(1);
    expect(
      r.match('import { Button } from "@mui/material";\nimport { BarChart } from "@mui/x-charts";', "src/g.tsx"),
    ).toBe(0);
    expect(r.match('import { DataGrid } from "@mui/x-data-grid";\nimport "@mui/x-charts";', "src/g.tsx")).toBe(1);
    expect(r.match('import { FaX } from "react-icons/fa";', "src/x.tsx")).toBe(1);
    expect(r.match('import A from "@/components/atoms/a";', "src/x.tsx")).toBe(1);
    expect(r.match('import A from "../molecules/a";', "src/components/ui/x.tsx")).toBe(1);
    expect(r.match('import { cn } from "@/lib/utils";', "src/x.tsx")).toBe(0);
  });

  it("frozen-folder", () => {
    const r = regra("frozen-folder");
    expect(r.match("", "src/components/molecules/arquivoNovoQueNaoExiste.tsx")).toBe(1);
    expect(r.match("", "src/components/ui/button.tsx")).toBe(0);
  });

  it("missing-stories", () => {
    const r = regra("missing-stories");
    expect(r.match("", "src/components/ui/nao-existe-xyz.tsx")).toBe(1);
    expect(r.match("", "src/components/ui/nao-existe-xyz.stories.tsx")).toBe(0);
    expect(r.match("", "src/components/outra/x.tsx")).toBe(0);
  });

  it("ds-review-marker", () => {
    expect(regra("ds-review-marker").match("a /* ds-review */ b /* ds-review: x */", "src/x.tsx")).toBe(2);
  });

  it("ui-semantic-only", () => {
    const r = regra("ui-semantic-only");
    expect(r.match('className="bg-gray-100 text-marine bg-primary"', "src/components/ui/x.tsx")).toBe(2);
    expect(r.match('className="bg-gray-100"', "src/components/outro/x.tsx")).toBe(0);
  });
});
