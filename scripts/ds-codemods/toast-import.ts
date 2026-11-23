// Varredura do import do toast (tickets/059 §3, Toast): `from "react-toastify"` vira `from "@/lib/toast"`.
// O wrapper (src/lib/toast.ts) e o ToastContainer (src/components/ui/toast.tsx) seguem no react-toastify.
import ts from "typescript";
import { type Edicao, Placar, type Resultado, aplicarEdicoes, criarSourceFile } from "./core";

export const DE = "react-toastify";
export const PARA = "@/lib/toast";

const PRESERVADOS = new Set(["src/lib/toast.ts", "src/lib/toast.test.ts", "src/components/ui/toast.tsx"]);

/** Só os `import`/`export … from` de `{ toast, Id, ToastOptions… }`; o `ToastContainer` fica de fora. */
function soDoWrapper(decl: ts.ImportDeclaration): boolean {
  const nb = decl.importClause?.namedBindings;
  if (!nb || !ts.isNamedImports(nb) || decl.importClause?.name) return false;
  return nb.elements.every((e) => (e.propertyName ?? e.name).text !== "ToastContainer");
}

export function transform(source: string, file: string): Resultado {
  const placar = new Placar();
  if (PRESERVADOS.has(file)) return { code: source, reviews: 0, replacements: 0, porRegra: placar.porRegra };
  const sf = criarSourceFile(source, file);
  const edicoes: Edicao[] = [];
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    if (st.moduleSpecifier.text !== DE || !soDoWrapper(st)) continue;
    edicoes.push({ inicio: st.moduleSpecifier.getStart(sf), fim: st.moduleSpecifier.getEnd(), texto: `"${PARA}"` });
    placar.troca("toast-import");
  }
  return { code: aplicarEdicoes(source, edicoes), reviews: 0, replacements: edicoes.length, porRegra: placar.porRegra };
}

// Executor próprio (não entra no `run.ts`: varre também os testes, que o guard não olha).
//   npx tsx scripts/ds-codemods/toast-import.ts [--dry-run]
export function varrerTudo(arquivos: string[], io: { ler: (f: string) => string; gravar?: (f: string, s: string) => void }) {
  const alterados: string[] = [];
  for (const f of arquivos) {
    const src = io.ler(f);
    const r = transform(src, f);
    if (r.code === src) continue;
    alterados.push(f);
    io.gravar?.(f, r.code);
  }
  return alterados;
}

async function main(dryRun: boolean) {
  const { execFileSync } = await import("node:child_process");
  const { readFileSync, writeFileSync } = await import("node:fs");
  const arquivos = execFileSync("git", ["ls-files", "src"], { encoding: "utf-8" })
    .split("\n")
    .filter((f) => /\.tsx?$/.test(f));
  const alterados = varrerTudo(arquivos, {
    ler: (f) => readFileSync(f, "utf-8"),
    gravar: dryRun ? undefined : (f, s) => writeFileSync(f, s),
  });
  console.log(`${dryRun ? "(dry-run) " : ""}arquivos alterados: ${alterados.length}`);
}

const executado = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").slice(-1)[0]);
if (executado && /toast-import\.ts$/.test(process.argv[1])) void main(process.argv.includes("--dry-run"));
