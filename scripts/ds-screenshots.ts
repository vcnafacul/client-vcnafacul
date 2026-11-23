/**
 * Capturas antes/depois do design system (tickets/059/01, §7.5).
 *
 * Percorre toda `/dev/vitrine/:componente/:estado` em 390x844, 390x640 e
 * 1280x800 nas DUAS versões do app e escreve `ds-screenshots/report.html` com
 * os pares lado a lado. O script não faz checkout: recebe duas URLs base.
 *
 * Como subir as duas (a vitrine usa `fetchFalso`/`authFalso`, não precisa de api):
 *
 *   # branch (depois), na pasta do repo
 *   yarn dev --port 5174
 *
 *   # develop (antes), num worktree à parte
 *   git worktree add ../client-develop origin/develop
 *   ln -s "$PWD/node_modules" ../client-develop/node_modules
 *   cp .env ../client-develop/.env          # se existir
 *   (cd ../client-develop && yarn dev --port 5173)
 *
 * Rodar (precisa de um Chrome; nada de caminho fixo):
 *
 *   DS_CHROME=/caminho/do/chrome \
 *     npx vite-node scripts/ds-screenshots.ts -- \
 *     --antes http://localhost:5173 --depois http://localhost:5174
 *
 * Opções: `--saida <pasta>` (padrão `ds-screenshots`), `--filtro <texto>`
 * (só rotas que contenham o texto). `ds-screenshots/` não vai para o commit.
 * Ao terminar: pare os dois servidores e remova o worktree.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer, { Browser, Page } from "puppeteer";
import {
  Dialogo,
  montarRelatorio,
  nomeDoArquivo,
  Par,
  Rota,
  rotasDosLinks,
  VIEWPORTS,
  Viewport,
} from "./ds-screenshots-lib";

function arg(nome: string): string | undefined {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const antes = arg("antes");
const depois = arg("depois");
const saida = path.resolve(arg("saida") ?? "ds-screenshots");
const filtro = arg("filtro");

if (!antes || !depois) {
  console.error("Uso: ds-screenshots.ts --antes <url da develop> --depois <url da branch> [--saida pasta] [--filtro texto]");
  process.exit(1);
}

/** Espera a página assentar: rede quieta, fontes carregadas e um respiro para animações. */
async function abrir(page: Page, base: string, caminho: string) {
  await page.goto(new URL(caminho, base).href, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));
}

/**
 * Para cada dialog aberto: o botão mais baixo do dialog cabe na janela? É uma
 * heurística: botões dentro de uma lista rolável (linhas, páginas) contam como
 * "fora" e dão falso alarme; confira o print dos casos marcados.
 */
async function medirDialogos(page: Page): Promise<Dialogo[]> {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    return [...document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]')].map((d) => {
      const titulo = (d.querySelector("h1,h2,h3")?.textContent ?? d.getAttribute("aria-label") ?? "(sem título)").trim();
      const botoes = [...d.querySelectorAll<HTMLElement>("button:not([aria-label='Fechar']):not([data-radix-collection-item])")];
      const principais = botoes.filter((b) => b.getBoundingClientRect().height > 0);
      if (!principais.length) return { titulo, acaoVisivel: true };
      const maisBaixo = Math.max(...principais.map((b) => b.getBoundingClientRect().bottom));
      return { titulo, acaoVisivel: maisBaixo <= vh };
    });
  });
}

async function capturar(
  browser: Browser,
  base: string,
  rota: Rota,
  vp: Viewport,
  arquivo: string,
  medir: boolean,
): Promise<{ ok: boolean; dialogos?: Dialogo[]; erro?: string }> {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: vp.width, height: vp.height });
    await abrir(page, base, rota.caminho);
    const dialogos = medir ? await medirDialogos(page) : undefined;
    await page.screenshot({ path: arquivo, fullPage: false });
    return { ok: true, dialogos };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  } finally {
    await page.close();
  }
}

async function main() {
  await mkdir(saida, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.DS_CHROME || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const indice = await browser.newPage();
    await indice.goto(new URL("/dev/vitrine", depois).href, { waitUntil: "networkidle0" });
    const hrefs = await indice.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
    await indice.close();
    let rotas = rotasDosLinks(hrefs);
    if (filtro) rotas = rotas.filter((r) => r.caminho.includes(filtro));
    console.log(`${rotas.length} rotas x ${VIEWPORTS.length} tamanhos`);

    const pares: Par[] = [];
    for (const rota of rotas) {
      for (const vp of VIEWPORTS) {
        const fa = nomeDoArquivo(rota, vp, "antes");
        const fd = nomeDoArquivo(rota, vp, "depois");
        const a = await capturar(browser, antes!, rota, vp, path.join(saida, fa), false);
        const d = await capturar(browser, depois!, rota, vp, path.join(saida, fd), vp.nome === "390x640");
        pares.push({
          rota,
          viewport: vp,
          antes: a.ok ? fa : null,
          depois: d.ok ? fd : null,
          dialogos: d.dialogos,
          erro: [a.erro && `develop: ${a.erro}`, d.erro && `branch: ${d.erro}`].filter(Boolean).join(" | ") || undefined,
        });
      }
      console.log(rota.caminho);
    }
    await writeFile(path.join(saida, "report.html"), montarRelatorio(pares, { antes: antes!, depois: depois! }));
    console.log(`Relatório: ${path.join(saida, "report.html")}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
