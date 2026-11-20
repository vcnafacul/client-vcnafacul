// Varredura de cores (tickets/059 §7.3: Text color, Background, Border/ring/outline/divide e
// Home hard-coded colors).
import ts from "typescript";
import {
  HOME,
  type Contexto,
  type Lista,
  type Resultado,
  type Token,
  legado,
  semOpacidade,
  transformarClasses,
} from "./core";

type Linha = { re: RegExp; para?: string; motivo?: string; regra: string };

const M = {
  placeholder: "placeholder → muted-foreground; desabilitado → opacity-50 no pai",
  ambar: "KPI de atenção → text-warning; com cara de link → text-primary",
  azul: "link → text-primary underline; informação → text-info; decoração → palette",
  laranja: "eyebrow → text-highlight; ênfase → text-foreground font-semibold; nunca laranja em fundo branco abaixo de AA",
  destaque: "destaque da home → text-highlight; senão o passo AA mais próximo via palette",
  textoOutro: "cor de texto sem mapeamento → token semântico ou passo AA via palette",
  homeMarine: 'na home: data-theme="marine" na seção',
  marineEscuro: 'seção com data-theme="marine"',
  solido: "sólido de status → bg-<status>; decoração → palette ou tema da home",
  gradDireita: "amostra → bg-success",
  bordaOutra: "borda sem mapeamento → border-border, border-input ou border-<status>",
  outra: "cor legada → token semântico ou palette",
};

const TEXTO: Linha[] = [
  { re: /^(?:marine|\[#0b2747\]|(?:gray|slate)-(?:900|800|700)|zinc-(?:900|800)|black)$/, para: "foreground", regra: "texto" },
  { re: /^(?:grey|darkGrey|(?:gray|slate)-(?:600|500)|zinc-(?:500|600))$/, para: "muted-foreground", regra: "texto" },
  { re: /^(?:gray-400|slate-400|gray2)$/, motivo: M.placeholder, regra: "texto" },
  { re: /^(?:red|redError|red-(?:500|600|700)|rose-(?:600|700))$/, para: "destructive", regra: "texto" },
  {
    re: /^(?:green2|green3|darkGreen|green-(?:600|700)|emerald-(?:600|700)|\[#0d7a63\])$/,
    para: "success",
    regra: "texto",
  },
  { re: /^(?:amber|yellow)-(?:600|700)$/, para: "warning", regra: "texto" },
  { re: /^\[#b35300\]$/, motivo: M.ambar, regra: "texto" },
  { re: /^(?:blue|sky|indigo)-\d{2,3}$/, motivo: M.azul, regra: "texto" },
  { re: /^(?:orange|darkOrange|orange-\d{2,3})$/, motivo: M.laranja, regra: "texto" },
  {
    re: /^(?:green|\[#37d6b5\]|pink|\[#da005a\]|rose-\d{2,3}|fuchsia-\d{2,3}|purple(?:-\d{2,3})?|lightGreen)$/,
    motivo: M.destaque,
    regra: "texto",
  },
];

const FUNDO: Linha[] = [
  { re: /^(?:backgroundGrey|(?:gray|slate|zinc)-50)$/, para: "page", regra: "fundo" },
  { re: /^(?:(?:gray|slate)-(?:100|200)|lightGray|zinc-100)$/, para: "muted", regra: "fundo" },
  { re: /^(?:marine|\[#0b2747\])$/, para: "primary", regra: "fundo" },
  { re: /^(?:backgroundMarine|\[#001b3a\])$/, motivo: M.marineEscuro, regra: "fundo" },
  { re: /^(?:orange|darkOrange)$/, para: "cta", regra: "fundo" },
  { re: /^(?:red|red-(?:500|600)|redError)$/, para: "destructive", regra: "fundo" },
  { re: /^(?:red|rose)-(?:50|100)$/, para: "destructive-muted", regra: "fundo" },
  { re: /^(?:green2|green3|darkGreen|(?:green|emerald)-(?:500|600))$/, para: "success", regra: "fundo" },
  { re: /^(?:(?:green|emerald)-(?:50|100)|\[#edfef8\])$/, para: "success-muted", regra: "fundo" },
  { re: /^(?:(?:yellow|amber)-(?:50|100)|lightYellow)$/, para: "warning-muted", regra: "fundo" },
  { re: /^(?:blue-(?:50|100)|sky-50)$/, para: "info-muted", regra: "fundo" },
];

const BORDA: Linha[] = [
  { re: /^(?:lightGray|gray-(?:100|200|300)|slate-(?:200|300)|zinc-200)$/, para: "border", regra: "borda" },
  { re: /^(?:gray-(?:[4-9]00|950)|grey)$/, para: "input", regra: "borda" },
  { re: /^marine$/, para: "primary", regra: "borda" },
  { re: /^orange$/, para: "cta", regra: "borda" },
  { re: /^(?:red(?:-\d{2,3})?|redError)$/, para: "destructive", regra: "borda" },
  { re: /^(?:green2|green-\d{2,3})$/, para: "success", regra: "borda" },
];

const DIVISOR: Linha[] = [
  { re: /^(?:lightGray|gray-\d{2,3}|slate-(?:200|300)|zinc-200)$/, para: "border", regra: "borda" },
];

const UTIL_COR =
  /^(bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|fill|stroke|from|via|to|outline|divide|decoration|accent|caret|shadow|placeholder)-(.+)$/;

export const TRIO_FOCO = ["focus-visible:ring-2", "focus-visible:ring-ring", "focus-visible:ring-offset-2"];

const ehFoco = (t: Token) => t.variantes.some((v) => v === "focus" || v === "focus-visible");
const anelLaranja = (t: Token) => /^(?:ring|outline)-(?:orange|darkOrange)(?:-\d{2,3})?(?:\/.+)?$/.test(t.util) || t.util === "ring-blue-500/30";

/**
 * ring-orange*, ring-blue-500/30, outline-orange, focus:ring-*, focus-visible:ring-* → trio de foco.
 * A cor laranja sem variante só entra quando a lista tem anel/contorno de foco; sozinha é um anel
 * permanente (seleção, destaque) e vai para revisão em processarCores.
 */
function anelDeFoco(lista: Lista, { placar }: Contexto) {
  const ativos = lista.ativos;
  const focoDeAnel = ativos.some((t) => ehFoco(t) && /^(?:ring|outline)(?:-|$)/.test(t.util) && t.util !== "outline-none");
  const doGrupo = (t: Token) =>
    !TRIO_FOCO.includes(t.raw) &&
    ((anelLaranja(t) && (ehFoco(t) || (t.variantes.length === 0 && focoDeAnel))) ||
      (ehFoco(t) && /^ring(?:-|$)/.test(t.util)));
  const grupo = ativos.filter(doGrupo);
  // dispara só com algo legado: focus:, anel laranja/azul ou focus-visible:ring-<cor legada>
  const dispara = grupo.some((t) => t.variantes.includes("focus") || anelLaranja(t) || legado.cor(t));
  if (!dispara) return;
  const anelBase = grupo.some((t) => t.variantes.length === 0);
  const contornoLaranja = grupo.some((t) => t.util.startsWith("outline-"));
  // larguras do anel/contorno laranja que saiu (focus:outline-none fica)
  const largura = ativos.filter(
    (t) =>
      !grupo.includes(t) &&
      ((anelBase && t.variantes.length === 0 && /^ring(?:-\d+)?$|^ring-offset-\d+$/.test(t.util)) ||
        (contornoLaranja && (t.variantes.length === 0 || ehFoco(t)) && /^outline(?:-\d+)?$|^outline-offset-\d+$/.test(t.util))),
  );
  const faltam = TRIO_FOCO.filter((c) => !ativos.some((t) => t.raw === c));
  [...grupo, ...largura]
    .sort((a, b) => lista.tokens.indexOf(a) - lista.tokens.indexOf(b))
    .forEach((t, i) => {
      t.saida = i === 0 ? faltam : [];
      placar.troca("foco");
    });
}

function porTabela(tabela: Linha[], valor: string) {
  const chave = valor.startsWith("[#") ? valor.toLowerCase() : valor;
  return tabela.find((l) => l.re.test(chave));
}

function corDoToken(t: Token, ctx: Contexto) {
  const { placar, file } = ctx;
  if (t.util === "bg-custom-gradient") return t.troca("bg-brand-stripe", "gradiente", placar);
  if (t.util === "bg-right-gradient") return t.revisa(M.gradDireita, "gradiente", placar);
  const m = UTIL_COR.exec(t.util);
  if (!m) return;
  const [, tipo, resto] = m;
  const [cor, opacidade] = semOpacidade(resto);
  const tabela =
    tipo === "text" ? TEXTO : tipo === "bg" ? FUNDO : tipo.startsWith("border") ? BORDA : tipo === "divide" ? DIVISOR : [];
  const linha = porTabela(tabela, cor);
  const generico = tipo === "text" ? M.textoOutro : tipo === "bg" ? M.solido : tipo.startsWith("border") ? M.bordaOutra : M.outra;
  if (!linha) {
    if (legado.cor(t)) t.revisa(generico, `${tabelaDe(tipo)}-revisao`, placar);
    return;
  }
  // placeholder:text-gray-400 é placeholder: já se sabe o destino
  if (linha.motivo === M.placeholder && t.variantes.includes("placeholder"))
    return t.troca(`text-muted-foreground${opacidade}`, linha.regra, placar);
  if (linha.para === "primary" && tipo === "bg" && HOME(file)) return t.revisa(M.homeMarine, "fundo-revisao", placar);
  if (linha.motivo) return t.revisa(linha.motivo, `${linha.regra}-revisao`, placar);
  t.troca(`${tipo}-${linha.para}${opacidade}`, linha.regra, placar);
}

const tabelaDe = (tipo: string) =>
  tipo === "text" ? "texto" : tipo === "bg" ? "fundo" : tipo.startsWith("border") || tipo === "divide" ? "borda" : "outra-cor";

export function processarCores(lista: Lista, ctx: Contexto) {
  anelDeFoco(lista, ctx);
  for (const t of lista.ativos) {
    if (t.mexido) continue;
    // anel laranja permanente ou com variante que não é de foco (ex.: data-[state=on]:) não vira foco
    if (anelLaranja(t)) {
      t.revisa("anel laranja fora de foco (seleção, destaque) → ring-cta ou ring-ring; se for foco → trio focus-visible", "foco-revisao", ctx.placar);
      continue;
    }
    corDoToken(t, ctx);
  }
}

// ---- hex cru (Home hard-coded colors) ----

const HEX_HOME: Record<string, string> = {
  "#37d6b5": "mint-400 para decoração e destaque sobre navy (text-highlight no tema marine); texto em fundo claro → mint-700",
  "#0b2747": "tokens do tema marine",
  "#da005a": "pink-600 (palette)",
  "#da005a22": "tint → pink-50 (palette)",
  "#2bbfa1": "mint-500 (palette)",
  "#001b3a": "marine-950 (palette)",
  "#f7b733": "decoração → yellow-400; eyebrow → text-highlight (yellow-700 no tema yellow)",
  "#fff5f8": "pink-50 (palette; tema pink aposentado)",
  "#edfef8": "mint-50 (palette; tema green aposentado)",
};
const HEX_OUTRO = "hex cru → palette.* ou chartSeries (passo mais próximo; texto em fundo claro com AA)";
const HEX = /(?<=^|[\s(,:])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?=$|[\s),;])/g;
// desenho de SVG (fill/stroke de <path>, <stop>…) não entra: é ilustração, não estilo de tela
const ATRIBUTO_SVG = /^(?:fill|stroke|stopColor|floodColor|lightingColor|color)$/;

export function revisarHex(texto: string, no: ts.Node, { placar }: Contexto): string[] {
  const p = no.parent;
  if (p && ts.isJsxAttribute(p) && ATRIBUTO_SVG.test(p.name.getText())) {
    const tag = p.parent.parent;
    if ((ts.isJsxOpeningElement(tag) || ts.isJsxSelfClosingElement(tag)) && /^[a-z]/.test(tag.tagName.getText())) return [];
  }
  const motivos: string[] = [];
  for (const [hex] of texto.matchAll(HEX)) {
    placar.revisao("hex-cru");
    motivos.push(`${hex} → ${HEX_HOME[hex.toLowerCase()] ?? HEX_OUTRO}`);
  }
  return motivos;
}

export function transform(source: string, file: string): Resultado {
  return transformarClasses(source, file, processarCores, revisarHex);
}
