/**
 * Partes puras do `ds-screenshots.ts` (tickets/059/01): lista de rotas da
 * vitrine e HTML do relatório lado a lado. Sem puppeteer, para testar no vitest
 * (`src/design-system/dsScreenshots.test.ts`).
 */

export type Viewport = { nome: string; width: number; height: number };

export const VIEWPORTS: Viewport[] = [
  { nome: "390x844", width: 390, height: 844 },
  { nome: "390x640", width: 390, height: 640 },
  { nome: "1280x800", width: 1280, height: 800 },
];

export type Rota = { componente: string; estado: string; caminho: string };

export type Dialogo = { titulo: string; acaoVisivel: boolean };

export type Par = {
  rota: Rota;
  viewport: Viewport;
  /** Caminhos relativos ao `report.html`; `null` se a captura falhou. */
  antes: string | null;
  depois: string | null;
  /** Dialogs abertos na captura "depois" (só medido na 390x640). */
  dialogos?: Dialogo[];
  erro?: string;
};

const PREFIXO = "/dev/vitrine/";

/** Extrai `/dev/vitrine/<componente>/<estado>` dos hrefs do índice da vitrine. */
export function rotasDosLinks(hrefs: string[]): Rota[] {
  const vistas = new Set<string>();
  const rotas: Rota[] = [];
  for (const href of hrefs) {
    const caminho = href.startsWith("http") ? new URL(href).pathname : href;
    if (!caminho.startsWith(PREFIXO)) continue;
    const [componente, estado, ...resto] = caminho.slice(PREFIXO.length).split("/");
    if (!componente || !estado || resto.length) continue;
    if (vistas.has(caminho)) continue;
    vistas.add(caminho);
    rotas.push({ componente, estado, caminho });
  }
  return rotas;
}

export function nomeDoArquivo(rota: Rota, viewport: Viewport, lado: "antes" | "depois"): string {
  return `${rota.componente}__${rota.estado}__${viewport.nome}__${lado}.png`;
}

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function imagem(src: string | null, alt: string): string {
  return src
    ? `<a href="${escapar(src)}"><img loading="lazy" src="${escapar(src)}" alt="${escapar(alt)}"></a>`
    : `<p class="falha">sem captura</p>`;
}

export function montarRelatorio(pares: Par[], bases: { antes: string; depois: string }): string {
  const porRota = new Map<string, Par[]>();
  for (const p of pares) {
    const lista = porRota.get(p.rota.caminho) ?? [];
    lista.push(p);
    porRota.set(p.rota.caminho, lista);
  }

  const semAcao = pares.flatMap((p) =>
    (p.dialogos ?? []).filter((d) => !d.acaoVisivel).map((d) => `${p.rota.caminho} (${p.viewport.nome}): ${d.titulo}`),
  );

  const secoes = [...porRota.entries()]
    .map(([caminho, lista]) => {
      const linhas = lista
        .map((p) => {
          const avisos = [
            p.erro ? `<p class="falha">${escapar(p.erro)}</p>` : "",
            ...(p.dialogos ?? []).map(
              (d) =>
                `<p class="${d.acaoVisivel ? "ok" : "falha"}">Dialog "${escapar(d.titulo)}": ação principal ${
                  d.acaoVisivel ? "visível" : "NÃO visível"
                }</p>`,
            ),
          ].join("");
          return `<div class="par"><h3>${p.viewport.nome}</h3>${avisos}<div class="lado"><figure><figcaption>develop</figcaption>${imagem(
            p.antes,
            `develop ${caminho} ${p.viewport.nome}`,
          )}</figure><figure><figcaption>branch</figcaption>${imagem(p.depois, `branch ${caminho} ${p.viewport.nome}`)}</figure></div></div>`;
        })
        .join("");
      return `<section><h2>${escapar(caminho)}</h2>${linhas}</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Antes e depois do design system</title>
<style>
body{font-family:system-ui,sans-serif;margin:16px;background:#f4f4f5;color:#111}
section{margin:0 0 32px;padding:12px;background:#fff;border:1px solid #ddd}
.lado{display:flex;gap:12px;align-items:flex-start;overflow-x:auto}
figure{margin:0}figcaption{font-weight:600;font-size:14px}
img{max-width:100%;border:1px solid #ccc}
.falha{color:#b00020;font-size:14px}.ok{color:#0d7a3f;font-size:14px}
</style></head><body>
<h1>Antes e depois do design system</h1>
<p>develop: ${escapar(bases.antes)} · branch: ${escapar(bases.depois)} · ${porRota.size} rotas, ${pares.length} pares</p>
${semAcao.length ? `<h2>Dialogs sem a ação principal visível em 390x640</h2><ul>${semAcao.map((s) => `<li class="falha">${escapar(s)}</li>`).join("")}</ul>` : "<p class=\"ok\">Nenhum Dialog com a ação principal fora da tela em 390x640.</p>"}
${secoes}
</body></html>
`;
}
