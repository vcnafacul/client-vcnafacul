// Executor dos codemods do design system (tickets/059 §7.3).
//   npx tsx scripts/ds-codemods/run.ts --dry-run [--sweep <nome>] [--top N] [--json] [caminhos…]
//   npx tsx scripts/ds-codemods/run.ts --sweep <nome> [caminhos…]      (escreve)
// --dry-run conta trocas e marcadores ds-review por arquivo e por regra, sem gravar nada.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { arquivosVarridos } from "../../src/design-system/guard/scan";
import * as arbitrary from "./arbitrary";
import * as colors from "./colors";
import type { Contagem, Resultado } from "./core";
import * as icons from "./icons";
import * as radiusShadowZ from "./radius-shadow-z";
import * as sizes from "./sizes";
import * as weights from "./weights";

export const VARREDURAS: Record<string, (source: string, file: string) => Resultado> = {
  colors: colors.transform,
  sizes: sizes.transform,
  weights: weights.transform,
  "radius-shadow-z": radiusShadowZ.transform,
  arbitrary: arbitrary.transform,
  icons: icons.transform,
};

/** O que o guard varre, menos components/ui (já no sistema) e a palette (espelho dos primitivos). */
export function alvos(arquivos: string[], caminhos: string[] = []): string[] {
  return arquivos.filter(
    (f) =>
      /\.tsx?$/.test(f) &&
      !/\.(test|spec|stories)\.tsx?$/.test(f) &&
      !f.startsWith("src/design-system/") &&
      !f.startsWith("src/components/ui/") &&
      f !== "src/lib/palette.ts" &&
      (!caminhos.length || caminhos.some((c) => f.startsWith(c.replace(/^\.\//, "")))),
  );
}

export type PorArquivo = { file: string; trocas: number; marcadores: number; revisoes: number };
export type Relatorio = {
  varredura: string;
  arquivos: number;
  trocas: number;
  marcadores: number;
  porRegra: Record<string, Contagem>;
  porArquivo: PorArquivo[];
};

type Io = { escrever: boolean; ler: (f: string) => string; gravar: (f: string, s: string) => void };

export function varrer(nome: string, arquivos: string[], io: Io): Relatorio {
  const transform = VARREDURAS[nome];
  if (!transform) throw new Error(`varredura desconhecida: ${nome}`);
  const rel: Relatorio = { varredura: nome, arquivos: 0, trocas: 0, marcadores: 0, porRegra: {}, porArquivo: [] };
  for (const file of arquivos) {
    const source = io.ler(file);
    const r = transform(source, file);
    const revisoes = Object.values(r.porRegra).reduce((s, c) => s + c.revisoes, 0);
    for (const [regra, c] of Object.entries(r.porRegra)) {
      const total = (rel.porRegra[regra] ??= { trocas: 0, revisoes: 0 });
      total.trocas += c.trocas;
      total.revisoes += c.revisoes;
    }
    if (r.code !== source) {
      rel.arquivos++;
      if (io.escrever) io.gravar(file, r.code);
    }
    rel.trocas += r.replacements;
    rel.marcadores += r.reviews;
    if (r.replacements || r.reviews || revisoes)
      rel.porArquivo.push({ file, trocas: r.replacements, marcadores: r.reviews, revisoes });
  }
  return rel;
}

export function formatar(rel: Relatorio, dryRun: boolean, top: number): string {
  const linhas = [
    `== ${rel.varredura}${dryRun ? " (dry-run)" : ""}`,
    `arquivos alterados: ${rel.arquivos} · trocas: ${rel.trocas} · marcadores ds-review: ${rel.marcadores}`,
    `  ${"regra".padEnd(26)}${"trocas".padStart(8)}${"revisões".padStart(10)}`,
    ...Object.entries(rel.porRegra)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([r, c]) => `  ${r.padEnd(26)}${String(c.trocas).padStart(8)}${String(c.revisoes).padStart(10)}`),
  ];
  const piores = [...rel.porArquivo].filter((a) => a.marcadores).sort((a, b) => b.marcadores - a.marcadores).slice(0, top);
  if (piores.length) {
    linhas.push(`  top ${piores.length} por marcadores:`);
    for (const a of piores) linhas.push(`    ${String(a.marcadores).padStart(4)}  ${a.file}`);
  }
  return linhas.join("\n");
}

export type Args = { dryRun: boolean; json: boolean; nomes: string[]; top: number; caminhos: string[] };

/** Lê os argumentos; flag desconhecida é erro (um "--dryrun" digitado errado não pode virar escrita). */
export function lerArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, json: false, nomes: [], top: 15, caminhos: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--json") args.json = true;
    else if (a === "--sweep") {
      const v = argv[++i];
      if (!v || v.startsWith("--")) throw new Error("--sweep pede um nome");
      args.nomes.push(...v.split(",").filter(Boolean));
    } else if (a === "--top") {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 0) throw new Error("--top pede um número");
      args.top = n;
    } else if (a.startsWith("--")) throw new Error(`flag desconhecida: ${a}`);
    else args.caminhos.push(a);
  }
  const lista = Object.keys(VARREDURAS).join(", ");
  if (!args.nomes.length || args.nomes.includes("all")) {
    if (!args.dryRun) throw new Error(`Escrita pede --sweep <nome> explícito. Varreduras: ${lista}`);
    args.nomes = Object.keys(VARREDURAS);
  }
  const desconhecidas = args.nomes.filter((n) => !VARREDURAS[n]);
  if (desconhecidas.length) throw new Error(`varredura desconhecida: ${desconhecidas.join(", ")}. Varreduras: ${lista}`);
  return args;
}

function main(argv: string[]) {
  let args: Args;
  try {
    args = lerArgs(argv);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(2);
  }
  const { dryRun, json, nomes, top, caminhos } = args;
  const arquivos = alvos(arquivosVarridos(), caminhos);
  const io: Io = {
    escrever: !dryRun,
    ler: (f) => readFileSync(f, "utf-8"),
    gravar: (f, s) => writeFileSync(f, s),
  };
  // cada varredura lê o disco: em dry-run, todas partem do mesmo código
  const relatorios = nomes.map((n) => varrer(n, arquivos, io));
  if (json) console.log(JSON.stringify(relatorios, null, 2));
  else console.log(relatorios.map((r) => formatar(r, dryRun, top)).join("\n\n"));
}

const aqui = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === aqui) {
  process.chdir(resolve(dirname(aqui), "../.."));
  main(process.argv.slice(2));
}
