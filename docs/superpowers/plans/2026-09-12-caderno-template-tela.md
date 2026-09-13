# Caderno — Card 13: a tela do template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao coordenador uma tela para baixar o modelo do caderno, subir de volta o zip editado no Overleaf, e publicar — fechando a etapa.

**Architecture:** Sete services finos, uma máquina de estados **pura** onde mora o risco, e um modal que só a renderiza. A separação existe para o que decide o comportamento ser testável sem MUI.

**Tech Stack:** React 19, Vite 6, MUI, Zustand, vitest + testing-library. **Nenhuma dependência nova.**

**Spec:** `docs/superpowers/specs/2026-09-12-caderno-template-tela-design.md`

---

## Contexto que o plano assume

Esta é a última peça da etapa. O que já existe:

| card | onde | estado |
|---|---|---|
| 10 | ms-simulado | ✅ mergeado (`#183`) — template versionado no Mongo |
| 11 | ms-simulado | `#184` aberto, **segurado** — o zip da prova usa o publicado, e o `GET /teste` |
| 12 | api-vcnafacul | `#543` aberto — os oito endpoints, atrás de `alterarPermissao` |

⚠️ **Nada disso bloqueia esta task**: os services mockam o `fetchWrapper` nos testes. Mas a tela só
funciona de verdade contra uma api com o `#543`, e o `/teste` só existe com o `#184`.

## ⚠️ Antes de começar: o `node_modules` local está velho

O `vitest` está no `package.json` e no `yarn.lock`, mas **não** no `node_modules` deste checkout — ele
é anterior ao merge do card 14.

```bash
yarn install --frozen-lockfile
```

⚠️ **Com `--frozen-lockfile`**, que é o que o CI usa. Ele **falha** em vez de reescrever o lockfile, e
é justamente essa a garantia que queremos: o repo irmão já teve um `yarn install` solto reescrevendo
~780 linhas sem relação com a mudança.

## O contrato da api, medido no card 12

| método | rota | resposta |
|---|---|---|
| `GET` | `/mssimulado/caderno/template` | a versão publicada |
| `GET` | `/mssimulado/caderno/template/rascunho` | o rascunho, ou **404** |
| `POST` | `/mssimulado/caderno/template/rascunho` | multipart → **200** com `{ aceitos, ignorados, erros, avisos }` |
| `DELETE` | `/mssimulado/caderno/template/rascunho` | 204 |
| `POST` | `/mssimulado/caderno/template/rascunho/publicar` | a versão nova, ou **409 com a lista de lint** |
| `GET` | `/mssimulado/caderno/template/versoes` | lista decrescente |
| `POST` | `/mssimulado/caderno/template/versoes/:n/restaurar` | **sem corpo** |
| `GET` | `/mssimulado/caderno/template/teste` | **zip** — `?versao=N` ou `?rascunho=1` |

⚠️ **O `POST /rascunho` responde 200 mesmo com `erros` preenchido.** De propósito: o rascunho é salvo
para o coordenador não perder o zip. **É a armadilha central deste card.**

⚠️ **`restaurar` não aceita notas** — o ms as ignora e escreve a sua própria.

## O que já foi verificado (não re-verifique)

| | |
|---|---|
| padrão de `FormData` | `services/cartaoResposta/uploadCartao.ts` — sem `Content-Type` |
| padrão de download binário | `services/caderno/baixarCaderno.ts` — decide por `response.ok` antes de ler o corpo |
| padrão de modal | `pages/dashProvas/modals/manageCategorias/` |
| padrão de confirmação | `manageCategorias/deleteConfirm.tsx` |
| toasts de loading/sucesso/erro | `hooks/useToastAsync.ts`, com `onFinally` |
| slot do botão | `pages/dashProvas/index.tsx:283-320` |
| gate do vizinho | `index.tsx:309` — "Gerenciar Categorias" usa `alterarPermissao` |
| estilo de teste | `services/question/getQuestionImage.test.ts` — `vi.mock("@/utils/fetchWrapper")` |
| vitest | `vite.config.ts:24-28` — jsdom, `src/**/*.{test,spec}.{ts,tsx}` |

## Restrições do repo

- ⚠️ **Não rode `npm run lint`** — está quebrado (ESLint 9 x `.eslintrc.cjs` legado) e **não é escopo deste card**. O portão é `yarn test` + `yarn build`.
- ⚠️ **Nunca** `git add -A` nem `git add .`.
- ⚠️ **Não instale nada.** Só `yarn install --frozen-lockfile` para materializar o que já está no lockfile.
- Testes: `yarn test` (todos) ou `npx vitest run <caminho>` (um).
- Branch `feature/caderno-13-template-tela`, já criada, **de `develop`**. Commits autônomos liberados.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/services/caderno/template/tipos.ts` | as formas que a api devolve |
| `src/services/caderno/template/{baixarModelo,subirRascunho,obterRascunho,descartarRascunho,publicar,listarVersoes,restaurar}.ts` | um por endpoint |
| `src/pages/dashProvas/modals/manageTemplate/estados.ts` | **a máquina de estados. Pura.** |
| `src/pages/dashProvas/modals/manageTemplate/index.tsx` | o modal |
| `src/pages/dashProvas/modals/manageTemplate/historico.tsx` | a aba de versões |
| `src/pages/dashProvas/modals/manageTemplate/confirmarDescarte.tsx` | no molde do `deleteConfirm.tsx` |
| `src/pages/dashProvas/index.tsx` | o botão e o registro do modal |
| `src/services/urls.ts` | a url base do template |

---

### Task 1: os sete services

**Files:**
- Create: `src/services/caderno/template/tipos.ts`
- Create: os sete `.ts` de service
- Create: `src/services/caderno/template/subirRascunho.test.ts`
- Create: `src/services/caderno/template/baixarModelo.test.ts`
- Create: `src/services/caderno/template/publicar.test.ts`
- Modify: `src/services/urls.ts`

- [ ] **Step 1: Instalar o que falta e confirmar que o vitest roda**

```bash
yarn install --frozen-lockfile
yarn test
```

Esperado: os testes que já existem passam. Se o `--frozen-lockfile` falhar, **pare e reporte** — quer
dizer que o `package.json` e o `yarn.lock` divergiram, e isso não é assunto deste card.

- [ ] **Step 2: Os tipos**

`tipos.ts`:

```ts
/** O que o ms devolve para uma versão de template. */
export interface VersaoTemplate {
  versao: number;
  status: "rascunho" | "publicada" | "arquivada";
  criadorId: string;
  publicadaEm: string | null;
  notas: string;
  origemVersao: number | null;
}

/**
 * O relatório de um upload.
 *
 * ⚠️ Ele chega com **HTTP 200 mesmo quando `erros` não está vazio**. O rascunho
 * é salvo de qualquer forma, para quem acabou de editar no Overleaf não perder
 * o zip — quem recusa é o publicar. Tratar isto como sucesso liso é o defeito
 * que faz o coordenador achar que publicou.
 */
export interface RelatorioDoRascunho {
  aceitos: string[];
  ignorados: string[];
  erros: string[];
  avisos: string[];
}
```

E em `urls.ts`, ao lado de `caderno`:

```ts
export const cadernoTemplate = `${caderno}/template`;
```

- [ ] **Step 3: Escrever os testes que falham**

Três arquivos de teste, no molde do `services/question/getQuestionImage.test.ts` (leia-o antes).

`subirRascunho.test.ts` — **o mais importante dos três**:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import fetchWrapper from "@/utils/fetchWrapper";
import { subirRascunho } from "./subirRascunho";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const arquivo = new File(["PKconteudo"], "projeto.zip", {
  type: "application/zip",
});

const relatorio = {
  aceitos: ["main.tex", "preambulo.tex"],
  ignorados: ["main.pdf"],
  erros: [],
  avisos: [],
};

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => relatorio,
  } as unknown as Response);
});

describe("subirRascunho", () => {
  it("manda FormData e NÃO declara Content-Type", async () => {
    // ⚠️ O browser põe o boundary do multipart. Declarar o header o
    // substitui por um sem boundary, e o servidor recebe um corpo que não
    // parseia. Mesmo padrão do uploadCartao.ts, e a mesma classe de defeito
    // que o card 12 mediu do outro lado.
    await subirRascunho(arquivo, "capa nova", "tok");

    const [, init] = mockedFetch.mock.calls[0];
    expect(init?.body).toBeInstanceOf(FormData);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    expect(Object.keys(headers).map((k) => k.toLowerCase())).not.toContain(
      "content-type",
    );
  });

  it("o FormData leva o arquivo e as notas", async () => {
    await subirRascunho(arquivo, "capa nova", "tok");
    const corpo = mockedFetch.mock.calls[0][1]?.body as FormData;
    expect(corpo.get("arquivo")).toBe(arquivo);
    expect(corpo.get("notas")).toBe("capa nova");
  });

  it("sem notas, não manda o campo", async () => {
    await subirRascunho(arquivo, "", "tok");
    const corpo = mockedFetch.mock.calls[0][1]?.body as FormData;
    expect(corpo.has("notas")).toBe(false);
  });

  it("DEVOLVE o relatório quando há erros de lint — não trata como falha", async () => {
    // ⚠️ O TESTE CENTRAL DESTE CARD. A api responde 200 com `erros`
    // preenchido, de propósito. Um service que lance aqui, ou que devolva
    // "ok", faz a tela dizer "enviado com sucesso" — e o coordenador fecha o
    // modal achando que publicou. A prova seguinte sai com o template velho,
    // e nada falha.
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ...relatorio,
        erros: ["main.tex — falta \\input{conteudo}"],
      }),
    } as unknown as Response);

    const r = await subirRascunho(arquivo, "", "tok");

    expect(r.erros).toHaveLength(1);
    expect(r.aceitos).toEqual(["main.tex", "preambulo.tex"]);
  });

  it("erro de verdade (413) vira mensagem, não relatório", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 413,
      json: async () => ({ message: "arquivo grande demais" }),
    } as unknown as Response);

    await expect(subirRascunho(arquivo, "", "tok")).rejects.toThrow(
      /grande demais/,
    );
  });
});
```

`baixarModelo.test.ts`:

```ts
describe("baixarModelo", () => {
  it("devolve o blob no caminho feliz", async () => { /* ok: true, blob() */ });

  it("monta ?versao=3", async () => { /* asserta a url */ });

  it("monta ?rascunho=1", async () => { /* asserta a url */ });

  it("decide pelo response.ok ANTES de ler o corpo", async () => {
    // ⚠️ Sucesso é binário, erro é JSON, e o corpo só pode ser lido UMA vez.
    // Ler o errado consome o stream e o download quebra. O baixarCaderno.ts
    // do card 06 já traz esse comentário.
    const blob = vi.fn();
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 409,
      blob,
      json: async () => ({ message: "nenhuma versão publicada" }),
    } as unknown as Response);

    await expect(baixarModelo({}, "tok")).rejects.toThrow(/nenhuma versão/);
    expect(blob).not.toHaveBeenCalled();
  });

  it("um 502 que devolve HTML não vira SyntaxError", async () => {
    // ⚠️ Proxy reverso responde HTML. Um `.json()` solto lançaria
    // SyntaxError e trocaria a mensagem útil por lixo.
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    } as unknown as Response);

    await expect(baixarModelo({}, "tok")).rejects.toThrow(/indisponível|erro/i);
  });
});
```

`publicar.test.ts`:

```ts
describe("publicar", () => {
  it("devolve a versão nova no caminho feliz", async () => { /* … */ });

  it("409 traz a LISTA de erros de lint na mensagem, não 'Conflito'", async () => {
    // ⚠️ É o que a tela mostra. Se o service colapsar a lista num texto
    // genérico, o coordenador não sabe o que consertar — e a api foi
    // construída para preservar essa lista exatamente por isso.
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: "o rascunho não passou no lint",
        erros: ["main.tex — falta \\input{conteudo}"],
      }),
    } as unknown as Response);

    await expect(publicar("tok")).rejects.toMatchObject({
      erros: ["main.tex — falta \\input{conteudo}"],
    });
  });
});
```

⚠️ O `publicar` **precisa carregar a lista** até a tela. Um `Error` comum perde o array — use um erro
com campo (`class ErroDeLint extends Error { erros: string[] }`) ou devolva um resultado
discriminado. **Não** serialize a lista dentro da string da mensagem: a tela precisa iterá-la.

- [ ] **Step 4: Rodar, confirmar vermelho, implementar os sete**

Todos usam `fetchWrapper` com `Authorization: Bearer`, no molde do `baixarCaderno.ts`. Os cinco sem
teste próprio (`obterRascunho`, `descartarRascunho`, `listarVersoes`, `restaurar`) são triviais — uma
chamada e um `json()`.

⚠️ **`obterRascunho` devolve `null` no 404**, não lança: "não há rascunho" é estado normal da tela, não
erro.

- [ ] **Step 5: Rodar e confirmar verde**

```bash
npx vitest run src/services/caderno/template/
```

- [ ] **Step 6: Provar que as decisões mordem**

| Mutação | Teste vermelho |
|---|---|
| declarar `"Content-Type": "multipart/form-data"` | `manda FormData e NÃO declara Content-Type` |
| `subirRascunho` lançar quando `erros.length > 0` | `DEVOLVE o relatório quando há erros de lint` |
| `baixarModelo` chamar `.blob()` antes de checar `ok` | `decide pelo response.ok ANTES de ler o corpo` |
| `publicar` jogar fora o array e só guardar `message` | `409 traz a LISTA de erros de lint` |

- [ ] **Step 7: Commit**

```bash
npx prettier --write "src/services/caderno/template/*.ts" src/services/urls.ts
git add src/services/caderno/template src/services/urls.ts
git commit -m "$(cat <<'EOF'
feat(caderno): services do template

subirRascunho DEVOLVE o relatorio quando ha erros de lint, em vez de
tratar como falha. A api responde 200 com `erros` preenchido de
proposito -- o rascunho e salvo pra quem acabou de editar no Overleaf
nao perder o zip. Um service que lance aqui faz a tela dizer "enviado
com sucesso", o coordenador fecha o modal achando que publicou, e a
prova seguinte sai com o template velho sem nada falhar.

publicar carrega a LISTA de erros ate a tela, nao so a mensagem: a api
foi construida pra preservar essa lista, e a tela precisa iterar.

baixarModelo decide pelo response.ok ANTES de tocar no corpo -- sucesso
e binario, erro e JSON, e o corpo so pode ser lido uma vez. Mesmo
comentario do baixarCaderno.ts do card 06.

FormData sem Content-Type: o browser poe o boundary. Mesmo padrao do
uploadCartao.ts.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `estados.ts` — a máquina de estados, pura

**Files:**
- Create: `src/pages/dashProvas/modals/manageTemplate/estados.ts`
- Create: `src/pages/dashProvas/modals/manageTemplate/estados.test.ts`

É onde mora o risco desta tela, e é por isso que ela sai do componente: dá para testar sem renderizar
MUI, e é exatamente aqui que telas assim erram.

Sem React, sem hook, sem import de componente. Uma função e alguns tipos.

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { describe, expect, it } from "vitest";
import { calcularEstado } from "./estados";

const publicada = {
  versao: 3,
  status: "publicada" as const,
  criadorId: "Fernando",
  publicadaEm: "2026-09-12T14:00:00.000Z",
  notas: "",
  origemVersao: null,
};

const relatorioLimpo = {
  aceitos: ["main.tex", "preambulo.tex"],
  ignorados: ["conteudo.tex", "main.pdf"],
  erros: [],
  avisos: [],
};

describe("sem rascunho", () => {
  it("não tem o que publicar nem descartar", () => {
    const e = calcularEstado({ publicada, relatorio: null });
    expect(e.tipo).toBe("sem-rascunho");
    expect(e.podePublicar).toBe(false);
    expect(e.podeDescartar).toBe(false);
    expect(e.versaoNoAr).toBe(3);
  });

  it("sem versão publicada, o topo diz isso em vez de mentir", () => {
    // ⚠️ `versaoNoAr: 0` ou string vazia apareceria como "versão " na tela.
    // Este é o estado real de um ambiente onde o seed ainda não rodou.
    const e = calcularEstado({ publicada: null, relatorio: null });
    expect(e.versaoNoAr).toBeNull();
  });
});

describe("rascunho COM erro de lint", () => {
  const comErro = {
    ...relatorioLimpo,
    erros: [
      "main.tex — falta \\input{conteudo}",
      "preambulo.tex — \\begin{center} sem \\end{center}",
    ],
  };

  it("PUBLICAR FICA DESABILITADO", () => {
    // ⚠️ O teste que impede o defeito que arruína a feature. Publicar um
    // template que não compila para de gerar prova para todo mundo, e a
    // api recusaria com 409 — mas a tela não pode oferecer o botão.
    const e = calcularEstado({ publicada, relatorio: comErro });
    expect(e.tipo).toBe("rascunho-com-erro");
    expect(e.podePublicar).toBe(false);
  });

  it("descartar continua disponível — é a saída dele", () => {
    const e = calcularEstado({ publicada, relatorio: comErro });
    expect(e.podeDescartar).toBe(true);
  });

  it("os erros chegam à tela na ordem, um a um", () => {
    const e = calcularEstado({ publicada, relatorio: comErro });
    expect(e.erros).toEqual(comErro.erros);
  });
});

describe("rascunho com AVISO, sem erro", () => {
  it("PUBLICAR FICA HABILITADO — aviso não bloqueia", () => {
    // ⚠️ Decisão do card 10, tomada pelo dono: chave desbalanceada avisa e
    // não bloqueia, porque é a única regra que dá falso positivo em LaTeX
    // válido, e o Overleaf já compilou antes do upload. Bloquear aqui
    // reverteria essa decisão em silêncio, do lado da tela.
    const e = calcularEstado({
      publicada,
      relatorio: { ...relatorioLimpo, avisos: ["2 chaves sem fechar"] },
    });
    expect(e.tipo).toBe("rascunho-limpo");
    expect(e.podePublicar).toBe(true);
    expect(e.avisos).toHaveLength(1);
  });
});

describe("os ignorados", () => {
  it("aparecem, porque é o que o coordenador esquece", () => {
    // ⚠️ O zip do Overleaf traz o projeto inteiro e a plataforma pega dois
    // arquivos. Sem esta lista ele acha que subiu mais do que subiu — e um
    // dia jura que trocou a logo pela tela.
    const e = calcularEstado({ publicada, relatorio: relatorioLimpo });
    expect(e.ignorados).toEqual(["conteudo.tex", "main.pdf"]);
  });

  it("zip sem sobras não inventa lista vazia visível", () => {
    const e = calcularEstado({
      publicada,
      relatorio: { ...relatorioLimpo, ignorados: [] },
    });
    expect(e.mostrarIgnorados).toBe(false);
  });
});

describe("depois de publicar", () => {
  it("volta a 'sem rascunho' e o topo mostra a versão nova", () => {
    const e = calcularEstado({
      publicada: { ...publicada, versao: 4 },
      relatorio: null,
    });
    expect(e.tipo).toBe("sem-rascunho");
    expect(e.versaoNoAr).toBe(4);
  });
});
```

- [ ] **Step 2: Rodar, confirmar vermelho, implementar**

```ts
export type TipoDeEstado =
  | "sem-rascunho"
  | "rascunho-com-erro"
  | "rascunho-limpo";

export interface EstadoDaTela {
  tipo: TipoDeEstado;
  versaoNoAr: number | null;
  podePublicar: boolean;
  podeDescartar: boolean;
  erros: string[];
  avisos: string[];
  ignorados: string[];
  mostrarIgnorados: boolean;
}

export function calcularEstado(entrada: {
  publicada: VersaoTemplate | null;
  relatorio: RelatorioDoRascunho | null;
}): EstadoDaTela;
```

⚠️ **`podePublicar` sai de `erros.length === 0`, e de mais nada.** Não de `avisos`, não de "o usuário
clicou em testar", não de um contador. Uma condição extra aqui é uma decisão de produto tomada por
acidente.

- [ ] **Step 3: Rodar e confirmar verde**

```bash
npx vitest run src/pages/dashProvas/modals/manageTemplate/estados.test.ts
```

- [ ] **Step 4: Provar que as três decisões mordem**

| Mutação | Teste vermelho |
|---|---|
| `podePublicar = erros.length === 0 && avisos.length === 0` | `PUBLICAR FICA HABILITADO — aviso não bloqueia` |
| `podePublicar = relatorio !== null` | `PUBLICAR FICA DESABILITADO` |
| `versaoNoAr = publicada?.versao ?? 0` | `sem versão publicada, o topo diz isso em vez de mentir` |

- [ ] **Step 5: Commit**

```bash
npx prettier --write "src/pages/dashProvas/modals/manageTemplate/estados*.ts"
git add src/pages/dashProvas/modals/manageTemplate/estados.ts src/pages/dashProvas/modals/manageTemplate/estados.test.ts
git commit -m "$(cat <<'EOF'
feat(caderno): maquina de estados da tela do template, pura e testada

Sai do componente pra poder ser testada sem renderizar MUI -- e e
exatamente aqui que telas assim erram.

podePublicar sai de erros.length === 0, e de mais nada. Nao de avisos:
aviso nao bloqueia foi decisao do dono no card 10 (chave desbalanceada e
a unica regra que da falso positivo em LaTeX valido, e o Overleaf ja
compilou antes do upload). Bloquear aqui reverteria essa decisao em
silencio, do lado da tela.

versaoNoAr e `null`, nao 0, quando nao ha versao publicada -- que e o
estado real de um ambiente onde o seed ainda nao rodou. Com 0 a tela
mostraria "versao 0".

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: o modal e o botão

**Files:**
- Create: `src/pages/dashProvas/modals/manageTemplate/index.tsx`
- Create: `src/pages/dashProvas/modals/manageTemplate/confirmarDescarte.tsx`
- Modify: `src/pages/dashProvas/index.tsx`

O molde é `modals/manageCategorias/`. **Leia o `index.tsx` e o `deleteConfirm.tsx` de lá antes.**

- [ ] **Step 1: O botão**

Em `pages/dashProvas/index.tsx`, no array `buttons`, **ao lado do "Gerenciar Categorias"**:

```ts
    {
      disabled: !permissao[Roles.alterarPermissao],
      onClick: () => modals.modalManageTemplate.open(),
      typeStyle: "secondary",
      size: "small",
      children: "Template do caderno",
    },
```

⚠️ **`disabled`, não escondido** — é o que o vizinho faz, e duas convenções na mesma barra confundem.
⚠️ **`alterarPermissao`**, a mesma do vizinho. O card cita uma `gerenciarTemplateCaderno` que **não
existe**: ela foi descartada no card 12.

Registre `modalManageTemplate` na lista de modais (linha ~53) e o componente no molde do
`ModalManageCategorias` (linha ~110).

- [ ] **Step 2: O modal**

Três passos numerados **na tela**, não em tooltip — quem usa isto abre a tela uma vez por trimestre.

**O texto do passo 2 precisa de cuidado.** O card manda copiar do `LEIA-ME.txt`, e **copiar literal
está errado**: a redação nova (card 11) diz *"entregue esse .zip a essa pessoa"*, falando com quem
**não** pode publicar. Quem lê esta tela **é** essa pessoa — copiar literal mandaria o administrador
entregar o zip a si mesmo.

O que precisa casar é a substância:

- suba o zip no Overleaf como projeto novo
- altere `main.tex` e `preambulo.tex`, **recompile e confira o PDF**
- baixe o projeto inteiro pelo **"Download"** do Overleaf
- não separe arquivo nenhum — a plataforma pega os dois de dentro

Estado e ações via `useToastAsync` (`hooks/useToastAsync.ts`), como o `deleteConfirm.tsx`:

| ação | loading | sucesso |
|---|---|---|
| subir | "Enviando o projeto…" | ⚠️ **depende do relatório** — ver abaixo |
| publicar | "Publicando…" | "v4 publicada. As próximas provas já usam ela." |
| descartar | "Descartando…" | "Rascunho descartado" |

⚠️ **A mensagem de sucesso do upload não pode ser um "enviado com sucesso" liso.** Com `erros`
preenchido, a resposta é 200 e o toast de sucesso faria o coordenador achar que acabou. Com erro, a
mensagem tem que dizer que **falta corrigir** — e a lista aparece na tela.

⚠️ **Clique duplo não dispara dois.** O `useToastAsync` tem `onFinally`; o `deleteConfirm.tsx` já usa
esse par com um `useState` de "em andamento". Copie.

- [ ] **Step 3: A confirmação de descarte**

No molde do `deleteConfirm.tsx`. Texto curto, dizendo que o rascunho se perde e que a versão publicada
não muda.

- [ ] **Step 4: Verificar à mão**

```bash
yarn build
yarn dev
```

Abra a `DashProva` e confira, **nesta ordem**:

1. o botão aparece desabilitado sem a permissão, habilitado com ela
2. os três passos estão visíveis, com o texto do Overleaf na tela
3. o "Gerenciar Categorias" ao lado continua abrindo e funcionando

⚠️ **O item 3 é regressão, não cortesia**: você mexeu no array de botões e na lista de modais que ele
usa.

⚠️ A api precisa estar de pé com o `#543`. Se não estiver, diga isso no relatório em vez de marcar o
step.

- [ ] **Step 5: Commit**

```bash
npx prettier --write "src/pages/dashProvas/modals/manageTemplate/*.tsx" src/pages/dashProvas/index.tsx
git add src/pages/dashProvas/modals/manageTemplate/index.tsx src/pages/dashProvas/modals/manageTemplate/confirmarDescarte.tsx src/pages/dashProvas/index.tsx
git commit -m "$(cat <<'EOF'
feat(caderno): tela de upload e publicacao do template

Tres passos numerados NA TELA, nao em tooltip: quem usa isto abre a tela
uma vez por trimestre e nao lembra da ordem.

O texto do passo 2 casa em substancia com o LEIA-ME.txt do card 11, mas
nao e copia literal -- aquele fala com quem NAO pode publicar ("entregue
esse .zip a essa pessoa"), e quem le esta tela E essa pessoa.

O toast de sucesso do upload depende do relatorio: com `erros`
preenchido a resposta e 200, e um "enviado com sucesso" liso faria o
coordenador achar que acabou.

Botao com `disabled` e `alterarPermissao`, igual ao "Gerenciar
Categorias" ao lado. O card citava uma permissao que nao existe.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: a aba Histórico

**Files:**
- Create: `src/pages/dashProvas/modals/manageTemplate/historico.tsx`
- Modify: `src/pages/dashProvas/modals/manageTemplate/index.tsx`

Lista `versão · data · autor · notas`, decrescente. Por linha, **Baixar** e **Restaurar**.

- [ ] **Step 1: Implementar**

- **Baixar** usa `baixarModelo({ versao: n })` — é como se confere uma versão antes de restaurá-la.
- **Restaurar** pede confirmação, e o texto é a parte que importa:

> Isto cria um **rascunho** a partir da v2. A v4 continua publicada até você publicar o rascunho.

⚠️ **Restaurar não é reverter, e a tela é o único lugar onde isso pode ser dito.** Sem essa frase, ele
clica esperando que a v2 volte ao ar na hora — e sai achando que o botão não funcionou, ou pior, que
funcionou.

⚠️ Depois de restaurar, o modal volta para a aba principal: agora **há** um rascunho pendente, e é lá
que ele publica.

- [ ] **Step 2: Verificar à mão**

Com a api de pé: listar, baixar uma versão antiga, restaurar, e confirmar que a aba principal passou a
mostrar o rascunho.

- [ ] **Step 3: Commit**

```bash
npx prettier --write src/pages/dashProvas/modals/manageTemplate/historico.tsx src/pages/dashProvas/modals/manageTemplate/index.tsx
git add src/pages/dashProvas/modals/manageTemplate/historico.tsx src/pages/dashProvas/modals/manageTemplate/index.tsx
git commit -m "$(cat <<'EOF'
feat(caderno): aba de historico com baixar e restaurar

A confirmacao do restaurar diz que ele cria um RASCUNHO e que a versao
publicada nao muda. Restaurar nao e reverter, e a tela e o unico lugar
onde isso pode ser dito -- sem a frase ele clica esperando a versao
antiga voltar ao ar na hora.

Baixar por versao existe pra conferir antes de restaurar.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: fechamento

- [ ] **Step 1: O portão**

```bash
yarn test
yarn build
```

⚠️ **Não rode `npm run lint`** — está quebrado e não é escopo. O CI cobra `test` e `build`.

- [ ] **Step 2: Revisar o diff**

```bash
git log --oneline develop..HEAD
git diff develop...HEAD --stat
```

Procure `console.log`, `.only`, e **qualquer mudança no `yarn.lock`** — não deveria haver nenhuma.

- [ ] **Step 3: PR**

Base `develop`. O corpo precisa cobrir:

- a tela, os quatro estados, e o botão com `alterarPermissao` (não a permissão que o card citava)
- **por que o critério de lint do card foi substituído** por `yarn test` + `yarn build`
- a armadilha do 200-com-erros, e o teste que a cobre
- ⚠️ **a ordem de deploy: `ms#184` → `api#543` → este** — e que só depois disso o ciclo Overleaf
  completo pode ser validado de ponta a ponta
