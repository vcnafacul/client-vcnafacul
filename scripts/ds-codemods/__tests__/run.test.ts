import { describe, expect, it } from "vitest";
import { VARREDURAS, alvos, formatar, lerArgs, varrer } from "../run";

describe("run", () => {
  it("varre o que o guard varre, menos components/ui e a palette", () => {
    expect(
      alvos([
        "src/pages/a/index.tsx",
        "src/pages/a/index.test.tsx",
        "src/pages/a/a.stories.tsx",
        "src/design-system/guard/rules.ts",
        "src/components/ui/button.tsx",
        "src/lib/palette.ts",
        "src/lib/utils.ts",
        "src/index.css",
      ]),
    ).toEqual(["src/pages/a/index.tsx", "src/lib/utils.ts"]);
    expect(alvos(["src/pages/a/x.tsx", "src/pages/b/y.tsx"], ["./src/pages/b"])).toEqual(["src/pages/b/y.tsx"]);
  });

  it("lê os argumentos e recusa flag desconhecida (um --dryrun não pode virar escrita)", () => {
    expect(lerArgs(["--dry-run", "--sweep", "colors,sizes", "--top", "5", "src/pages"])).toEqual({
      dryRun: true,
      json: false,
      nomes: ["colors", "sizes"],
      top: 5,
      caminhos: ["src/pages"],
    });
    expect(() => lerArgs(["--dryrun", "--sweep", "colors"])).toThrow(/flag desconhecida: --dryrun/);
    expect(() => lerArgs(["--sweep"])).toThrow(/--sweep pede um nome/);
    expect(() => lerArgs(["--sweep", "cores"])).toThrow(/varredura desconhecida: cores/);
    expect(() => lerArgs(["--sweep", "colors", "--top", "x"])).toThrow(/--top pede um número/);
    expect(() => lerArgs([])).toThrow(/Escrita pede --sweep/);
    expect(lerArgs(["--dry-run"]).nomes).toEqual(Object.keys(VARREDURAS));
  });

  it("tem as seis varreduras", () =>
    expect(Object.keys(VARREDURAS).sort()).toEqual(["arbitrary", "colors", "icons", "radius-shadow-z", "sizes", "weights"]));

  it("--dry-run conta por arquivo e por regra sem gravar", () => {
    const arquivos: Record<string, string> = {
      "src/pages/a.tsx": 'export const A = () => <p className="text-gray-500 text-orange" />;\n',
      "src/pages/b.tsx": 'export const B = () => <p className="text-foreground" />;\n',
    };
    const gravados: string[] = [];
    const rel = varrer("colors", Object.keys(arquivos), {
      escrever: false,
      ler: (f) => arquivos[f],
      gravar: (f) => gravados.push(f),
    });
    expect(gravados).toEqual([]);
    expect(rel).toMatchObject({ arquivos: 1, trocas: 1, marcadores: 1 });
    expect(rel.porRegra).toEqual({ texto: { trocas: 1, revisoes: 0 }, "texto-revisao": { trocas: 0, revisoes: 1 } });
    expect(rel.porArquivo).toEqual([{ file: "src/pages/a.tsx", trocas: 1, marcadores: 1, revisoes: 1 }]);
    expect(formatar(rel, true, 15)).toContain("arquivos alterados: 1 · trocas: 1 · marcadores ds-review: 1");
  });

  it("--sweep grava os arquivos alterados", () => {
    const gravados: Record<string, string> = {};
    varrer("weights", ["src/pages/a.tsx"], {
      escrever: true,
      ler: () => 'export const A = () => <p className="font-light" />;\n',
      gravar: (f, s) => (gravados[f] = s),
    });
    expect(gravados).toEqual({ "src/pages/a.tsx": 'export const A = () => <p className="font-normal" />;\n' });
  });
});
