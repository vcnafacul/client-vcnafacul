import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ⚠️ Guarda: componente declarado DENTRO de outro e usado como `<X />`.
 *
 * Cada render do pai cria uma função nova — para o React, um tipo novo — e ele
 * desmonta e remonta o `<X />`: o modal refazia a busca, perdia a vista
 * ("Ver simulados" voltava para os detalhes) e o que estava sendo editado.
 * Sem hook no corpo, chamar como função (`{X()}`) resolve. Com hook, extraia
 * para fora do componente em vez de chamar como função.
 */
const DECLARACAO = /^(\s{2,})const ([A-Z][A-Za-z0-9]*) = \(\) =>\s*[({]/gm;

function corpo(texto: string, inicio: number): string {
  let j = texto.indexOf("=>", inicio) + 2;
  while (/\s/.test(texto[j])) j++;
  const abre = texto[j];
  const fecha = abre === "(" ? ")" : "}";
  let n = 0;
  for (let k = j; k < texto.length; k++) {
    if (texto[k] === abre) n++;
    else if (texto[k] === fecha && --n === 0) return texto.slice(j, k + 1);
  }
  return "";
}

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return nome.endsWith(".tsx") && !nome.includes(".test.") ? [caminho] : [];
  });
}

describe("componentes declarados dentro do render", () => {
  it("nenhum sem hook é usado como <X /> (remontaria a cada render)", () => {
    const achados: string[] = [];
    for (const arquivo of arquivos(join(__dirname))) {
      const texto = readFileSync(arquivo, "utf8");
      for (const m of texto.matchAll(DECLARACAO)) {
        const nome = m[2];
        if (!new RegExp(`<${nome}\\s*/>`).test(texto)) continue;
        if (/\buse[A-Z]\w*\(/.test(corpo(texto, m.index!))) continue;
        achados.push(`${arquivo.replace(__dirname, "src")}: <${nome} /> → {${nome}()}`);
      }
    }
    expect(achados).toEqual([]);
  });
});
