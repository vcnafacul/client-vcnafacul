import { describe, expect, it } from "vitest";
import { transform } from "../colors";
import { classes, esperaIntacto, esperaRevisao, esperaTroca, semErroDeSintaxe } from "./ajuda";

const HOME = "src/pages/homeV2/Hero.tsx";

describe("colors — Text color (§7.3)", () => {
  it("marine, #0b2747, gray/slate 900–700, zinc 900/800, black → text-foreground", () =>
    esperaTroca(
      transform,
      ["text-marine", "text-[#0b2747]", "text-[#0B2747]", "text-gray-900", "text-gray-800", "text-gray-700",
        "text-slate-900", "text-slate-800", "text-slate-700", "text-zinc-900", "text-zinc-800", "text-black"],
      "text-foreground",
    ));

  it("grey, darkGrey, gray/slate 600/500, zinc 500/600 → text-muted-foreground", () =>
    esperaTroca(
      transform,
      ["text-grey", "text-darkGrey", "text-gray-600", "text-gray-500", "text-slate-600", "text-slate-500", "text-zinc-500", "text-zinc-600"],
      "text-muted-foreground",
    ));

  it("gray-400, slate-400, gray2 → review (placeholder ou desabilitado)", () => {
    esperaRevisao(transform, ["text-gray-400", "text-slate-400", "text-gray2"], /placeholder → muted-foreground/);
    // com a variante placeholder: o destino já é conhecido
    esperaTroca(transform, ["placeholder:text-gray-400"], "placeholder:text-muted-foreground");
  });

  it("red, redError, red 500–700, rose 600/700 → text-destructive", () =>
    esperaTroca(
      transform,
      ["text-red", "text-redError", "text-red-500", "text-red-600", "text-red-700", "text-rose-600", "text-rose-700"],
      "text-destructive",
    ));

  it("green2, green3, darkGreen, green/emerald 600/700, #0d7a63 → text-success", () =>
    esperaTroca(
      transform,
      ["text-green2", "text-green3", "text-darkGreen", "text-green-600", "text-green-700", "text-emerald-600", "text-emerald-700", "text-[#0d7a63]"],
      "text-success",
    ));

  it("amber/yellow 600/700 → text-warning", () =>
    esperaTroca(transform, ["text-amber-600", "text-amber-700", "text-yellow-600", "text-yellow-700"], "text-warning"));

  it("#b35300 → review (atenção ou link)", () =>
    esperaRevisao(transform, ["text-[#b35300]"], /KPI de atenção → text-warning/));

  it("blue-*, sky-*, indigo-* → review (link, info ou decoração)", () =>
    esperaRevisao(transform, ["text-blue-600", "text-blue-500", "text-sky-500", "text-indigo-700"], /link → text-primary underline/));

  it("orange, darkOrange, orange-* → review (eyebrow ou ênfase)", () =>
    esperaRevisao(transform, ["text-orange", "text-darkOrange", "text-orange-500"], /eyebrow → text-highlight/));

  it("green (mint), #37d6b5, pink, #da005a, rose-* (outros), fuchsia, purple*, lightGreen → review (destaque)", () =>
    esperaRevisao(
      transform,
      ["text-green", "text-[#37d6b5]", "text-pink", "text-[#da005a]", "text-rose-500", "text-fuchsia-600", "text-purple", "text-purple-700", "text-lightGreen"],
      /destaque da home → text-highlight/,
    ));

  it("text-white fica (permitido)", () => esperaIntacto(transform, ["text-white", "hover:text-white"]));

  it("cor legada sem linha na tabela → review genérica (o guard ainda a contaria)", () =>
    esperaRevisao(transform, ["text-gray-300", "text-red-400", "text-yellow"], /cor de texto sem mapeamento/));
});

describe("colors — Background (§7.3)", () => {
  it("backgroundGrey, gray/slate/zinc-50 → bg-page", () =>
    esperaTroca(transform, ["bg-backgroundGrey", "bg-gray-50", "bg-slate-50", "bg-zinc-50"], "bg-page"));

  it("gray/slate 100/200, lightGray, zinc-100 → bg-muted", () =>
    esperaTroca(transform, ["bg-gray-100", "bg-gray-200", "bg-slate-100", "bg-slate-200", "bg-lightGray", "bg-zinc-100"], "bg-muted"));

  it("marine, #0b2747 → bg-primary; na home → review (data-theme marine)", () => {
    esperaTroca(transform, ["bg-marine", "bg-[#0b2747]"], "bg-primary");
    esperaRevisao(transform, ["bg-marine"], /data-theme="marine"/, HOME);
  });

  it("backgroundMarine, #001b3a → review (seção marine)", () =>
    esperaRevisao(transform, ["bg-backgroundMarine", "bg-[#001b3a]"], /data-theme="marine"/));

  it("orange, darkOrange → bg-cta", () => esperaTroca(transform, ["bg-orange", "bg-darkOrange"], "bg-cta"));

  it("red, red-500/600, redError → bg-destructive", () =>
    esperaTroca(transform, ["bg-red", "bg-red-500", "bg-red-600", "bg-redError"], "bg-destructive"));

  it("red/rose 50/100 → bg-destructive-muted", () =>
    esperaTroca(transform, ["bg-red-50", "bg-red-100", "bg-rose-50", "bg-rose-100"], "bg-destructive-muted"));

  it("green2, green3, darkGreen, green/emerald 500/600 → bg-success", () =>
    esperaTroca(
      transform,
      ["bg-green2", "bg-green3", "bg-darkGreen", "bg-green-500", "bg-green-600", "bg-emerald-500", "bg-emerald-600"],
      "bg-success",
    ));

  it("green/emerald 50/100, #edfef8 → bg-success-muted", () =>
    esperaTroca(transform, ["bg-green-50", "bg-green-100", "bg-emerald-50", "bg-emerald-100", "bg-[#edfef8]"], "bg-success-muted"));

  it("yellow/amber 50/100, lightYellow → bg-warning-muted", () =>
    esperaTroca(transform, ["bg-yellow-50", "bg-yellow-100", "bg-amber-50", "bg-amber-100", "bg-lightYellow"], "bg-warning-muted"));

  it("blue-50/100, sky-50 → bg-info-muted", () =>
    esperaTroca(transform, ["bg-blue-50", "bg-blue-100", "bg-sky-50"], "bg-info-muted"));

  it("bg-black/50 e /65 (overlays) ficam: saem com o overlay, na troca pelo Dialog", () =>
    esperaIntacto(transform, ["bg-black/50", "bg-black/65"]));

  it("blue-500/600, amber-400/500, yellow, green, #37d6b5, #2bbfa1, pink, #da005a, purple, lightGreen, gray-300+ → review", () =>
    esperaRevisao(
      transform,
      ["bg-blue-500", "bg-blue-600", "bg-amber-400", "bg-amber-500", "bg-yellow", "bg-green", "bg-[#37d6b5]", "bg-[#2bbfa1]",
        "bg-pink", "bg-[#da005a]", "bg-purple", "bg-lightGreen", "bg-gray-300", "bg-gray-800"],
      /sólido de status → bg-<status>/,
    ));

  it("bg-white fica (permitido)", () => esperaIntacto(transform, ["bg-white"]));

  it("bg-custom-gradient → bg-brand-stripe", () => esperaTroca(transform, ["bg-custom-gradient"], "bg-brand-stripe"));

  it("bg-right-gradient → review (amostra bg-success)", () =>
    esperaRevisao(transform, ["bg-right-gradient"], /bg-success/));
});

describe("colors — Border, ring, outline, divide (§7.3)", () => {
  it("lightGray, gray 100–300, slate 200/300, zinc-200 → border-border; divide-gray-* → divide-border", () => {
    esperaTroca(
      transform,
      ["border-lightGray", "border-gray-100", "border-gray-200", "border-gray-300", "border-slate-200", "border-slate-300", "border-zinc-200"],
      "border-border",
    );
    esperaTroca(transform, ["divide-gray-200", "divide-gray-100"], "divide-border");
    esperaTroca(transform, ["border-b-gray-200"], "border-b-border");
  });

  it("gray-400+, grey → border-input", () =>
    esperaTroca(transform, ["border-gray-400", "border-gray-500", "border-gray-950", "border-grey"], "border-input"));

  it("marine → border-primary", () => esperaTroca(transform, ["border-marine"], "border-primary"));

  it("orange → border-cta", () => esperaTroca(transform, ["border-orange"], "border-cta"));

  it("red*, redError → border-destructive", () =>
    esperaTroca(transform, ["border-red", "border-red-500", "border-red-300", "border-redError"], "border-destructive"));

  it("green2, green-* → border-success", () =>
    esperaTroca(transform, ["border-green2", "border-green-500", "border-green-200"], "border-success"));

  it("ring-orange*, ring-blue-500/30, outline-orange, focus:ring-*, focus-visible:ring-* → trio de foco", () => {
    const trio = "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
    esperaTroca(transform, ["focus:ring-2 focus:ring-orange", "focus:ring-2 focus:ring-marine focus:ring-offset-1"], trio);
    // cor sem variante ao lado de anel/contorno de foco é a cor do foco
    esperaTroca(transform, ["focus:ring-2 ring-orange", "focus:ring-2 ring-blue-500/30", "focus-visible:ring ring-orange-500/50"], trio);
    expect(classes(transform, "focus:outline-none focus:outline outline-2 outline-orange").classes).toBe(`focus:outline-none ${trio}`);
    esperaTroca(transform, ["focus-visible:ring-2 focus-visible:ring-blue-500"], trio);
    expect(classes(transform, "rounded focus:outline-none focus:ring-2 focus:ring-orange p-2").classes).toBe(
      `rounded focus:outline-none ${trio} p-2`,
    );
    // já no sistema: nada muda
    esperaIntacto(transform, [trio]);
    // anel laranja permanente (seleção, destaque) ou com variante que não é de foco não vira foco
    esperaRevisao(
      transform,
      ["ring-2 ring-orange/50", "ring-blue-500/30", "outline-orange", "data-[state=on]:ring-orange"],
      /anel laranja fora de foco/,
    );
  });

  it("border-2 (botões V1) fica: sai com o Button V1", () => esperaIntacto(transform, ["border-2"]));
});

describe("colors — Home hard-coded colors (§7.3)", () => {
  const hex = (h: string, file = HOME) => transform(`export const s = { color: "${h}" };\n`, file);

  it("#37d6b5 → mint-400 (decoração/destaque) ou mint-700 (texto em fundo claro)", () => {
    const r = hex("#37d6b5");
    expect(r.code).toContain(`"#37d6b5" /* ds-review: #37d6b5 → mint-400`);
    expect(r.code).toMatch(/mint-700/);
    expect(r.reviews).toBe(1);
  });

  it("#0b2747 → tokens do tema marine", () => expect(hex("#0B2747").code).toMatch(/ds-review: #0B2747 → tokens do tema marine/));

  it("#da005a, #da005a22 → pink-600; tint → pink-50", () => {
    expect(hex("#da005a").code).toMatch(/#da005a → pink-600/);
    expect(hex("#da005a22").code).toMatch(/#da005a22 → tint → pink-50/);
  });

  it("#2bbfa1 → mint-500", () => expect(hex("#2bbfa1").code).toMatch(/#2bbfa1 → mint-500/));

  it("#001b3a → marine-950", () => expect(hex("#001b3a").code).toMatch(/#001b3a → marine-950/));

  it("#f7b733 → yellow-400 (decoração) ou text-highlight (eyebrow)", () =>
    expect(hex("#f7b733").code).toMatch(/#f7b733 → decoração → yellow-400; eyebrow → text-highlight/));

  it("#fff5f8, #edfef8 → pink-50, mint-50", () => {
    expect(hex("#fff5f8").code).toMatch(/#fff5f8 → pink-50/);
    expect(hex("#edfef8").code).toMatch(/#edfef8 → mint-50/);
  });

  it("hex cru em gráfico e estilo inline → palette.* / chartSeries", () => {
    const r = transform(
      `export const series = [{ color: "#123456" }, { color: "#abc" }];\nexport const s = { border: "1px solid #ccc" };\n`,
      "src/pages/dash/Grafico.tsx",
    );
    expect(r.reviews).toBe(3);
    expect(r.code).toMatch(/"#123456" \/\* ds-review: #123456 → hex cru → palette\.\* ou chartSeries/);
    expect(r.code).toMatch(/"1px solid #ccc" \/\* ds-review: #ccc → hex cru/);
    expect(r.porRegra["hex-cru"]).toEqual({ trocas: 0, revisoes: 3 });
    // desenho de SVG (fill de <path>) e âncoras não entram
    const svg = transform(`export const I = () => <svg><path fill="#37d6b5" /></svg>;\nconst a = "#topo";\n`, HOME);
    expect(svg.reviews).toBe(0);
  });
});

describe("colors — casos da Task 9", () => {
  it("template literal com ternário", () => {
    const src = 'export const A = ({ ok }: { ok: boolean }) => <p className={`mt-2 ${ok ? "text-red" : "text-gray-500"}`} />;\n';
    expect(transform(src, "src/pages/x/A.tsx").code).toBe(
      'export const A = ({ ok }: { ok: boolean }) => <p className={`mt-2 ${ok ? "text-destructive" : "text-muted-foreground"}`} />;\n',
    );
  });

  it('cn({ "bg-orange": cta })', () => {
    const r = transform('const c = cn({ "bg-orange": cta });\n', "src/pages/x/a.ts");
    expect(r.code).toBe('const c = cn({ "bg-cta": cta });\n');
  });

  it('variante cva com "border-lightGray"', () => {
    const src = 'const v = cva("rounded", { variants: { tom: { neutro: "border border-lightGray" } } });\n';
    expect(transform(src, "src/pages/x/a.ts").code).toBe(
      'const v = cva("rounded", { variants: { tom: { neutro: "border border-border" } } });\n',
    );
  });

  it("hover:bg-gray-100 → hover:bg-muted (variantes e opacidade preservadas)", () => {
    esperaTroca(transform, ["hover:bg-gray-100"], "hover:bg-muted");
    esperaTroca(transform, ["bg-gray-100/50"], "bg-muted/50");
    esperaTroca(transform, ["md:hover:!text-gray-500"], "md:hover:!text-muted-foreground");
    esperaTroca(transform, ["[&>svg]:text-gray-700"], "[&>svg]:text-foreground");
  });

  it("text-orange fica, com o marcador ds-review", () => {
    const { classes: saida, revisao, r } = classes(transform, "font-bold text-orange");
    expect(saida).toBe("font-bold text-orange");
    expect(revisao).toMatch(/^text-orange → eyebrow/);
    expect(r.reviews).toBe(1);
    semErroDeSintaxe(r.code);
  });
});
