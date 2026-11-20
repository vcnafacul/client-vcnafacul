import { describe, expect, it } from "vitest";
import { transform as cores } from "../colors";
import { Lista } from "../core";
import { transform as raio } from "../radius-shadow-z";
import { transform as tamanhos } from "../sizes";
import { semErroDeSintaxe } from "./ajuda";

const TS = "src/pages/x/estilos.ts";
const TSX = "src/pages/x/index.tsx";

describe("core — o que conta como lista de classes", () => {
  it("constante de classes passada depois ao className é varrida (todos os tokens com cara de classe)", () => {
    const src = 'const campo = "h-9 border border-gray-300 text-sm";\nexport const A = () => <input className={campo} />;\n';
    expect(cores(src, TSX).code).toContain('const campo = "h-9 border border-border text-sm";');
    expect(tamanhos(src, TSX).code).toContain('const campo = "h-9 border border-gray-300 text-body";');
  });

  it("texto, comparação, tipo, import e atributo que não é de classe não mudam", () => {
    const src = [
      'import "./text-red.css";',
      'type Tom = "text-red" | "bg-orange";',
      'const msg = "Erro: text-red falhou";',
      'const ok = (t: string) => t === "text-red";',
      'export const A = () => <Avatar variant="rounded" data-x="text-red text-sm" />;',
      'export const B = () => <div title="text-red text-sm" />;',
      'const m = { sombra: "shadow" };',
      "",
    ].join("\n");
    expect(cores(src, TSX)).toMatchObject({ code: src, reviews: 0, replacements: 0 });
    expect(raio(src, TSX)).toMatchObject({ code: src, reviews: 0, replacements: 0 });
    expect(tamanhos(src, TSX)).toMatchObject({ code: src, reviews: 0, replacements: 0 });
  });

  it("prop de componente com lista de classes é varrida", () => {
    const src = 'export const A = () => <Badge cor="bg-green-100 text-green-700" />;\n';
    expect(cores(src, TSX).code).toBe('export const A = () => <Badge cor="bg-success-muted text-success" />;\n');
  });

  it("palavra solta (rounded, shadow) só é classe em contexto de classe", () => {
    const src = 'const forma = "rounded";\nexport const A = () => <div className={cn("rounded", ok && "shadow")} />;\n';
    expect(raio(src, TSX).code).toBe('const forma = "rounded";\nexport const A = () => <div className={cn("rounded-sm", ok && "shadow-sm")} />;\n');
  });

  it("valores de compoundVariants/defaultVariants são nomes de variante; class/className são classes", () => {
    const src =
      'const v = tv({ base: "rounded", variants: { forma: { rounded: "rounded" } }, compoundVariants: [{ forma: "rounded", class: "shadow" }], defaultVariants: { forma: "rounded" } });\n';
    expect(raio(src, TS).code).toBe(
      'const v = tv({ base: "rounded-sm", variants: { forma: { rounded: "rounded-sm" } }, compoundVariants: [{ forma: "rounded", class: "shadow-sm" }], defaultVariants: { forma: "rounded" } });\n',
    );
  });

  it("propriedade *ClassName e variável terminada em Class também são contexto de classe", () => {
    const src = 'const cardClass = "shadow";\nexport const A = () => <T rowClassName="rounded" />;\nconst c = { className: "z-10" };\n';
    expect(raio(src, TSX).code).toBe(
      'const cardClass = "shadow-sm";\nexport const A = () => <T rowClassName="rounded-sm" />;\nconst c = { className: "z-raised" };\n',
    );
  });

  it("template literal: token colado em ${} é parcial e não muda", () => {
    const src = "export const A = () => <p className={`text-${tom}-500 text-gray-500 bg-${x}`} />;\n";
    expect(cores(src, TSX).code).toBe("export const A = () => <p className={`text-${tom}-500 text-muted-foreground bg-${x}`} />;\n");
  });

  it("template multilinha preserva a formatação", () => {
    const src = "const c = cn(`\n  text-lg leading-7\n  font-bold\n`);\n";
    expect(tamanhos(src, TS).code).toBe("const c = cn(`\n  text-h3\n  font-bold\n`);\n");
  });

  it("marcador vai depois da string, inclusive em chave de objeto, e o código segue válido", () => {
    const src = 'export const A = () => <div className={cn({ "text-orange": a }, "p-2 text-blue-600")} />;\n';
    const r = cores(src, TSX);
    expect(r.code).toBe(
      'export const A = () => <div className={cn({ "text-orange" /* ds-review: text-orange → eyebrow → text-highlight; ênfase → text-foreground font-semibold; nunca laranja em fundo branco abaixo de AA */: a }, "p-2 text-blue-600" /* ds-review: text-blue-600 → link → text-primary underline; informação → text-info; decoração → palette */)} />;\n',
    );
    expect(r.reviews).toBe(2);
    semErroDeSintaxe(r.code);
  });

  it("rodar duas vezes dá o mesmo código, sem marcador novo", () => {
    const src = 'export const A = () => <div className="text-orange bg-gray-100 text-gray-500" />;\n';
    const um = cores(src, TSX);
    const dois = cores(um.code, TSX);
    expect(dois.code).toBe(um.code);
    expect(dois.reviews).toBe(0);
    expect(dois.replacements).toBe(0);
  });
});

describe("core — Lista", () => {
  it("remove tokens sem deixar espaço duplo", () => {
    const l = new Lista("  a b c  ");
    l.tokens[0].saida = [];
    l.tokens[1].saida = ["x", "y"];
    expect(l.render()).toBe("  x y c  ");
    const l2 = new Lista("a b c");
    l2.tokens[1].saida = [];
    expect(l2.render()).toBe("a c");
  });

  it("separa variantes, importante e utilitário", () => {
    const [t] = new Lista("md:[&>svg]:hover:!bg-gray-100/50").tokens;
    expect(t.prefixo).toBe("md:[&>svg]:hover:");
    expect(t.importante).toBe(true);
    expect(t.util).toBe("bg-gray-100/50");
  });
});
