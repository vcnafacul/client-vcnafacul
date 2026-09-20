# O relatório do simulado — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A tela que a série inteira existe para produzir — o coordenador de cursinho abre um simulado e vê, linha a linha, como cada estudante foi: quem não enviou cartão, quem enviou e a leitura falhou (com o motivo), e quem foi lido.

**Architecture:** Uma rota nova (`/dashboard/relatorio-simulado/:simuladoId`, com `?turma=` opcional) que monta um componente de relatório parametrizado pelo recorte — o mesmo que o card `05` vai reusar. A tabela é o `DashTable` do Dash V2 usado **direto**, sem o `DashListTemplate` e sem contexto sintético. A ação que leva até lá entra no `simuladosView`, que é compartilhado entre duas telas, e por isso é **ligada por prop** só pela `PartnerPrepProvas`.

**Tech Stack:** React 19, Vite, TypeScript, React Router v7, Tailwind, Radix, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-19-relatorio-do-simulado-design.md`

---

## Estrutura de arquivos

| arquivo | responsabilidade |
|---|---|
| `src/dtos/relatorioSimulado/relatorioSimulado.ts` | **novo** — todos os tipos do relatório |
| `src/services/relatorioSimulado/buscarRelatorio.ts` | **novo** — linhas + resumo |
| `src/services/relatorioSimulado/buscarQuestoes.ts` | **novo** — agregado por questão |
| `src/services/relatorioSimulado/buscarSimuladosComCartao.ts` | **novo** — o `04b` |
| `src/pages/relatorioSimulado/statusDaLinha.ts` | **novo** — função pura status → `{tone, label}` |
| `src/pages/relatorioSimulado/colunas.tsx` | **novo** — colunas da tabela de estudantes |
| `src/pages/relatorioSimulado/ResumoDoRelatorio.tsx` | **novo** — as contagens e a média |
| `src/pages/relatorioSimulado/TabelaDeQuestoes.tsx` | **novo** — a aba de questões |
| `src/pages/relatorioSimulado/index.tsx` | **novo** — a página: abas, fetch, estados |
| `src/pages/relatorioSimulado/voltar.ts` | **novo** — o tipo do `location.state` |
| `src/routes/path.ts` | +`RELATORIO_SIMULADO` |
| `src/routes/PlatformRoutes.tsx` | +a rota, com `ProtectedRoutePermission` |
| `src/services/urls.ts` | +`relatorioSimulado` |
| `src/pages/dashProvas/modals/AcaoIcone.tsx` | intocado — só consumido |
| `src/pages/dashProvas/modals/simuladosView.tsx` | +prop `relatorio` e a ação |
| `src/pages/dashProvas/modals/showProva.tsx` | +repasse da prop |
| `src/pages/partnerPrepProvas/index.tsx` | liga a prop, navega com `state`, restaura |
| `src/components/dashV2/DashListTemplate.tsx` | +`paginaInicial`/`onPaginaChange` + guard no clamp |
| `src/components/organisms/header/index.tsx` e o sidebar | +`print:hidden` |

---

## ⚠️ Regras da casa

- **Rodar teste:** `npx vitest run <caminho>`. Rodar tudo: `npx vitest run`.
- ⚠️ **`npm run lint` está quebrado no repo** (ESLint 9 procurando `eslint.config.js` com `.eslintrc.cjs` legado). Use `ESLINT_USE_FLAT_CONFIG=false npx eslint <caminhos>`.
- ⚠️ **Radix Popper é caro no jsdom.** `DashToolbar.test.tsx` leva ~51s para 22 testes, e o custo vaza entre testes. **Poucos testes abrindo tooltip**, cada um verificando tudo de uma abertura só. Lógica de status é função pura e se testa sem render.
- **Serviços são mockados com `vi.mock` no caminho exato do import** — não há `msw` no projeto.
- ⚠️ **`@testing-library/user-event` NÃO está instalado**, e não deve ser instalado por causa deste
  card. Use `fireEvent`. Onde as tasks abaixo escrevem `userEvent.click(...)`, troque — foi erro de
  quem escreveu o plano.
- ⚠️ **E `fireEvent.click` não troca aba do Radix.** O `TabsTrigger` reage a **`onMouseDown`**; um
  `click` deixa a aba parada e faz um teste de "não rebuscou" passar sem provar nada. Use
  `fireEvent.mouseDown` para abas. Há um helper `abrirAba()` em
  `src/pages/relatorioSimulado/index.test.tsx` — leia antes de escrever o seu.
- Commit **adicionando por nome**, nunca `git add .`.

---

## Task 1: Tipos e serviços

**Files:**
- Create: `src/dtos/relatorioSimulado/relatorioSimulado.ts`
- Create: `src/services/relatorioSimulado/buscarRelatorio.ts`
- Create: `src/services/relatorioSimulado/buscarQuestoes.ts`
- Create: `src/services/relatorioSimulado/buscarSimuladosComCartao.ts`
- Modify: `src/services/urls.ts`
- Test: `src/services/relatorioSimulado/buscarRelatorio.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/services/relatorioSimulado/buscarRelatorio.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { buscarRelatorio } from "./buscarRelatorio";
import { buscarQuestoes } from "./buscarQuestoes";
import { buscarSimuladosComCartao } from "./buscarSimuladosComCartao";

const fetchWrapper = vi.hoisted(() => vi.fn());
vi.mock("@/utils/fetchWrapper", () => ({ default: fetchWrapper }));

const ok = (body: unknown) => ({ status: 200, json: async () => body });

describe("serviços do relatório de simulado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchWrapper.mockResolvedValue(ok({}));
  });

  it("buscarRelatorio sem turma NÃO manda turma na URL", async () => {
    await buscarRelatorio("tok", "sim-1");

    const url = fetchWrapper.mock.calls[0][0] as string;
    expect(url).toContain("/mssimulado/relatorio/simulado/sim-1");
    expect(url).not.toContain("turma");
  });

  it("buscarRelatorio com turma usa o segmento de turma", async () => {
    await buscarRelatorio("tok", "sim-1", "t-1");

    expect(fetchWrapper.mock.calls[0][0]).toContain(
      "/mssimulado/relatorio/simulado/sim-1/turma/t-1",
    );
  });

  it("manda o Bearer", async () => {
    await buscarRelatorio("tok-abc", "sim-1");

    const opcoes = fetchWrapper.mock.calls[0][1] as { headers: Record<string, string> };
    expect(opcoes.headers.Authorization).toBe("Bearer tok-abc");
  });

  it("status diferente de 200 vira erro em português", async () => {
    fetchWrapper.mockResolvedValue({ status: 500, json: async () => ({}) });

    await expect(buscarRelatorio("tok", "sim-1")).rejects.toThrow(
      /relatório/i,
    );
  });

  it("buscarQuestoes com turma usa o sufixo /questoes depois da turma", async () => {
    await buscarQuestoes("tok", "sim-1", "t-1");

    expect(fetchWrapper.mock.calls[0][0]).toContain(
      "/mssimulado/relatorio/simulado/sim-1/turma/t-1/questoes",
    );
  });

  it("buscarSimuladosComCartao não leva simuladoId nenhum", async () => {
    await buscarSimuladosComCartao("tok");

    const url = fetchWrapper.mock.calls[0][0] as string;
    expect(url).toMatch(/\/mssimulado\/relatorio\/simulado\/simulados$/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/services/relatorioSimulado/buscarRelatorio.test.ts`
Expected: FAIL — os módulos não existem.

- [ ] **Step 3: Criar os tipos**

`src/dtos/relatorioSimulado/relatorioSimulado.ts`:

```ts
import { FalhaHistorico } from "../cartaoResposta/resultados";

/**
 * O status de um cartão no relatório.
 *
 * ⚠️ **União própria, não o `HistoricoStatus` de `historico/historicoDTO.ts`.**
 * Aquele é `'pending' | 'processing' | 'completed' | 'failed'` — está
 * desatualizado (não tem `awaiting_omr`) e é consumido pela tela do estudante.
 * Acrescentar valor lá para servir a esta tela arrisca a outra.
 */
export type StatusDoCartao =
  | "pending"
  | "processing"
  | "awaiting_omr"
  | "completed"
  | "failed";

export interface LinhaDoRelatorio {
  usuario: string;
  nome: string;
  matricula: string;
  turmaId: string | null;
  turmaNome: string | null;
  /**
   * ⚠️ Explícito de propósito. **Não inferir de `historicoId` ausente** — a api
   * manda este campo justamente para ninguém inferir e inferir errado.
   */
  enviouCartao: boolean;
  historicoId?: string;
  status?: StatusDoCartao;
  cartaoCode?: string;
  questoesRespondidas?: number;
  /**
   * ⚠️ **Pode vir preenchido com nota VELHA numa linha `failed`.** O
   * `marcarFalha` do ms não limpa `aproveitamento`, e a api repassa como veio
   * — de propósito, ela não reescreve o que o ms disse. Quem decide não
   * mostrar é a tela. Ver `colunas.tsx`.
   */
  aproveitamentoGeral?: number;
  falha?: FalhaHistorico;
}

export interface ResumoDoRelatorio {
  totalNoRecorte: number;
  comLeituraConcluida: number;
  aproveitamentoGeral: number | null;
  totalEstudantesComCartaoNoCursinho: number;
  temEstudanteSemTurma: boolean;
  /** Quem saiu do cursinho depois de enviar. ⚠️ Contado, nunca listado. */
  linhasSemEstudanteAtivo: number;
}

export interface RelatorioDoSimulado {
  linhas: LinhaDoRelatorio[];
  resumo: ResumoDoRelatorio;
}

export interface QuestaoDoRelatorio {
  numero: number | null;
  questaoId: string;
  respondentes: number;
  acertos: number;
  erros: number;
  /**
   * ⚠️ `semLeitura`, não "em branco": o ms-omr descarta questão em branco e
   * dupla marcação do mesmo jeito, então os dois chegam indistinguíveis.
   */
  semLeitura: number;
  porAlternativa: Record<string, number>;
}

export interface QuestoesDoRelatorio {
  questoes: QuestaoDoRelatorio[];
}

export interface SimuladoComCartao {
  simuladoId: string;
  nome: string | null;
  /** Quantos ESTUDANTES enviaram, não quantas fotos chegaram. */
  cartoes: number;
  comLeituraConcluida: number;
  ultimoEnvio: string | null;
}

export interface SimuladosComCartao {
  simulados: SimuladoComCartao[];
}
```

- [ ] **Step 4: Acrescentar a URL**

Em `src/services/urls.ts`, depois da linha `export const cartaoResposta = ...`:

```ts
/**
 * ⚠️ Não confundir com o `report` acima (`${simulado}/report`), que é o POST
 * de respostas do aluno. Este é o relatório do coordenador.
 */
export const relatorioSimulado = `${mssimulado}/relatorio/simulado`;
```

- [ ] **Step 5: Criar os três serviços**

`src/services/relatorioSimulado/buscarRelatorio.ts`:

```ts
import { RelatorioDoSimulado } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { relatorioSimulado } from "../urls";

/**
 * ⚠️ O recorte é **segmento de caminho**, não query. A api expõe
 * `/:simuladoId` e `/:simuladoId/turma/:turmaId` como rotas distintas, e o
 * `cursinhoId` nunca viaja: sai do JWT do outro lado.
 */
export function caminhoDoRelatorio(simuladoId: string, turmaId?: string): string {
  return turmaId
    ? `${relatorioSimulado}/${simuladoId}/turma/${turmaId}`
    : `${relatorioSimulado}/${simuladoId}`;
}

export async function buscarRelatorio(
  token: string,
  simuladoId: string,
  turmaId?: string,
): Promise<RelatorioDoSimulado> {
  const response = await fetchWrapper(caminhoDoRelatorio(simuladoId, turmaId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o relatório do simulado");
  }
  return await response.json();
}
```

`src/services/relatorioSimulado/buscarQuestoes.ts`:

```ts
import { QuestoesDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { caminhoDoRelatorio } from "./buscarRelatorio";

export async function buscarQuestoes(
  token: string,
  simuladoId: string,
  turmaId?: string,
): Promise<QuestoesDoRelatorio> {
  const response = await fetchWrapper(
    `${caminhoDoRelatorio(simuladoId, turmaId)}/questoes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o desempenho por questão");
  }
  return await response.json();
}
```

`src/services/relatorioSimulado/buscarSimuladosComCartao.ts`:

```ts
import { SimuladosComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { relatorioSimulado } from "../urls";

/**
 * Quais simulados do cursinho têm cartão enviado — o card `04b`.
 *
 * ⚠️ Exige `gerenciarEstudantes` e um colaborador com cursinho: chamar sem isso
 * devolve 403. Ver o gate em `simuladosView`.
 */
export async function buscarSimuladosComCartao(
  token: string,
): Promise<SimuladosComCartao> {
  const response = await fetchWrapper(`${relatorioSimulado}/simulados`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar os simulados com cartão");
  }
  return await response.json();
}
```

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `npx vitest run src/services/relatorioSimulado/`
Expected: PASS, 6 testes.

- [ ] **Step 7: Commit**

```bash
git add src/dtos/relatorioSimulado src/services/relatorioSimulado src/services/urls.ts
git commit -m "feat: tipos e servicos do relatorio de simulado"
```

---

## Task 2: `statusDaLinha`, função pura

⚠️ **Função pura, testada sem render.** É o padrão da casa para isto — ver `dashProvas/modals/simuladoStatus.ts` (`statusVisual`) e `dashProvas/columns.tsx` (`statusDaProva`). Também é o que mantém o custo de teste baixo, dado que este diretório sofre com Radix no jsdom.

**Files:**
- Create: `src/pages/relatorioSimulado/statusDaLinha.ts`
- Test: `src/pages/relatorioSimulado/statusDaLinha.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { describe, expect, it } from "vitest";
import { statusDaLinha } from "./statusDaLinha";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana Silva",
  matricula: "2025001",
  turmaId: "t-1",
  turmaNome: "Turma A",
  enviouCartao: true,
  status: "completed",
  ...over,
});

describe("statusDaLinha", () => {
  it("quem não enviou cartão tem rótulo próprio, não 'erro'", () => {
    // Não enviar não é falha: é o estado normal de metade da turma antes de a
    // digitalização terminar.
    const { tone, label } = statusDaLinha(linha({ enviouCartao: false, status: undefined }));

    expect(label).toBe("Não enviou");
    expect(tone).toBe("neutral");
  });

  it("enviouCartao manda, mesmo com historicoId presente", () => {
    // a api devolve `enviouCartao` explícito justamente para ninguém inferir
    const { label } = statusDaLinha(
      linha({ enviouCartao: false, historicoId: "h1", status: "completed" }),
    );

    expect(label).toBe("Não enviou");
  });

  it.each([
    ["completed", "Lido", "done"],
    ["failed", "Falhou", "missing"],
    ["awaiting_omr", "Aguardando leitura", "running"],
    ["pending", "Aguardando leitura", "running"],
    ["processing", "Aguardando leitura", "running"],
  ])("status %s vira %s", (status, label, tone) => {
    const r = statusDaLinha(linha({ status: status as never }));

    expect(r.label).toBe(label);
    expect(r.tone).toBe(tone);
  });

  it("status desconhecido não quebra a tela", () => {
    // o ms pode ganhar um status novo antes do client; a linha tem que
    // continuar renderizando
    const r = statusDaLinha(linha({ status: "status_do_futuro" as never }));

    expect(r.label).toBeTruthy();
    expect(r.tone).toBe("neutral");
  });

  it("enviou mas sem status também não quebra", () => {
    const r = statusDaLinha(linha({ status: undefined }));

    expect(r.label).toBeTruthy();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/relatorioSimulado/statusDaLinha.test.ts`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

```ts
import type { StatusV2 } from "@/components/dashV2";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

export interface StatusVisualDaLinha {
  tone: StatusV2;
  label: string;
}

/**
 * O status de uma linha do relatório, em tom e rótulo.
 *
 * ⚠️ Pura de propósito: montar Radix no jsdom custa caro neste projeto, e
 * lógica de status é justamente o que não precisa de DOM para ser verificada.
 * Mesmo padrão do `statusVisual` em `dashProvas/modals/simuladoStatus.ts`.
 */
export function statusDaLinha(linha: LinhaDoRelatorio): StatusVisualDaLinha {
  // ⚠️ `enviouCartao` primeiro, e explícito. Inferir "não enviou" da ausência
  // de `historicoId` é o que a api evitou mandando o campo.
  if (!linha.enviouCartao) {
    return { tone: "neutral", label: "Não enviou" };
  }

  switch (linha.status) {
    case "completed":
      return { tone: "done", label: "Lido" };
    case "failed":
      return { tone: "missing", label: "Falhou" };
    case "awaiting_omr":
    case "pending":
    case "processing":
      return { tone: "running", label: "Aguardando leitura" };
    default:
      // ⚠️ O ms pode ganhar um status antes do client. Rótulo honesto em vez
      // de linha quebrada — e nunca "Lido", que afirmaria o que não se sabe.
      return { tone: "neutral", label: "Situação desconhecida" };
  }
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/relatorioSimulado/statusDaLinha.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/relatorioSimulado/statusDaLinha.ts src/pages/relatorioSimulado/statusDaLinha.test.ts
git commit -m "feat: statusDaLinha do relatorio, como funcao pura"
```

---

## Task 3: As colunas da tabela de estudantes

⚠️ **A regra central deste arquivo: nota só quando `status === 'completed'`.** É o mesmo defeito que a revisão do card `04` pegou no cálculo da média, reaparecendo na célula — o `marcarFalha` do ms não limpa `aproveitamento`, e a api repassa como veio.

**Files:**
- Create: `src/pages/relatorioSimulado/colunas.tsx`
- Test: `src/pages/relatorioSimulado/colunas.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { colunasDoRelatorio } from "./colunas";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana Silva",
  matricula: "2025001",
  turmaId: "t-1",
  turmaNome: "Turma A",
  enviouCartao: true,
  status: "completed",
  aproveitamentoGeral: 0.8,
  questoesRespondidas: 90,
  ...over,
});

const celula = (id: string, l: LinhaDoRelatorio, comTurma = false) => {
  const col = colunasDoRelatorio({ comTurma }).find((c) => c.id === id)!;
  render(<>{col.cell(l)}</>);
};

describe("colunas do relatório", () => {
  it("⚠️ linha que FALHOU não mostra nota, mesmo trazendo uma", () => {
    // O `marcarFalha` do ms não limpa `aproveitamento`: um cartão que leu bem,
    // foi refotografado e falhou mantém a nota antiga, e a api repassa como
    // veio — de propósito. Mostrar aqui contradiz o status na mesma linha.
    celula("aproveitamento", linha({ status: "failed", aproveitamentoGeral: 0.2 }));

    expect(screen.queryByText(/20/)).not.toBeInTheDocument();
  });

  it.each([["awaiting_omr"], ["pending"], ["processing"]])(
    "status %s também não mostra nota",
    (status) => {
      celula(
        "aproveitamento",
        linha({ status: status as never, aproveitamentoGeral: 0.5 }),
      );

      expect(screen.queryByText(/50/)).not.toBeInTheDocument();
    },
  );

  it("linha lida mostra a nota em porcentagem", () => {
    celula("aproveitamento", linha({ aproveitamentoGeral: 0.8 }));

    expect(screen.getByText(/80/)).toBeInTheDocument();
  });

  it("⚠️ nota ausente é vazio, nunca zero — zero é uma nota", () => {
    celula("aproveitamento", linha({ aproveitamentoGeral: undefined }));

    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("o motivo é coluna própria, com a descrição que o ms mandou pronta", () => {
    celula(
      "motivo",
      linha({
        status: "failed",
        falha: {
          codigo: "cartao_nao_detectado",
          descricao: "Não foi possível localizar o cartão na foto",
          acaoSugerida: "reenviar_foto",
        },
      }),
    );

    expect(
      screen.getByText(/não foi possível localizar o cartão/i),
    ).toBeInTheDocument();
  });

  it("estudante mostra nome e matrícula", () => {
    celula("estudante", linha());

    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText(/2025001/)).toBeInTheDocument();
  });

  it("sem turma no recorte, a coluna Turma EXISTE", () => {
    const ids = colunasDoRelatorio({ comTurma: false }).map((c) => c.id);

    expect(ids).toContain("turma");
  });

  it("⚠️ com turma no recorte, a coluna Turma SOME — seria constante", () => {
    const ids = colunasDoRelatorio({ comTurma: true }).map((c) => c.id);

    expect(ids).not.toContain("turma");
  });

  it("estudante sem turma mostra travessão, não vazio", () => {
    celula("turma", linha({ turmaNome: null, turmaId: null }));

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("ordena por nome com regra pt-BR", () => {
    const col = colunasDoRelatorio({ comTurma: false }).find(
      (c) => c.id === "estudante",
    )!;

    expect(col.sortValue!(linha({ nome: "Ática" }))).toBe("Ática");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/relatorioSimulado/colunas.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

`src/pages/relatorioSimulado/colunas.tsx`:

```tsx
import { dashV2, StatusBadge, type DashColumn } from "@/components/dashV2";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { statusDaLinha } from "./statusDaLinha";

export const VAZIO = "—";

/**
 * A nota só existe para leitura concluída.
 *
 * ⚠️ **Esta é a regra mais importante do arquivo.** O `marcarFalha` do ms
 * grava `status` e `falha` e **não limpa `aproveitamento`** — um cartão que
 * leu bem, foi refotografado e falhou continua carregando a nota antiga. A api
 * repassa como veio, de propósito: ela não reescreve o que o ms disse.
 * Renderizar aqui mostraria "Falhou" e "20%" na mesma linha, e a aba de
 * questões (que filtra por status no ms) já não conta esse cartão.
 *
 * ⚠️ E ausência vira vazio, **nunca zero**: zero é uma nota, ausência de
 * leitura não é.
 */
function textoDoAproveitamento(linha: LinhaDoRelatorio): string {
  if (linha.status !== "completed") return VAZIO;
  if (typeof linha.aproveitamentoGeral !== "number") return VAZIO;
  return `${Math.round(linha.aproveitamentoGeral * 100)}%`;
}

export function colunasDoRelatorio({
  comTurma,
}: {
  /** `true` quando o recorte já é de uma turma — aí a coluna Turma some. */
  comTurma: boolean;
}): DashColumn<LinhaDoRelatorio>[] {
  const colunas: DashColumn<LinhaDoRelatorio>[] = [
    {
      id: "estudante",
      header: "Estudante",
      primary: true,
      cell: (l) => (
        <>
          <span className={cn("block font-medium", dashV2.text.primary)}>
            {l.nome}
          </span>
          <span className={cn("block text-xs", dashV2.text.muted)}>
            {l.matricula}
          </span>
        </>
      ),
      // `sortRows` já resolve localeCompare pt-BR — devolver a string crua basta
      sortValue: (l) => l.nome,
    },
  ];

  // ⚠️ Coluna constante só ocupa largura que os nomes precisam.
  if (!comTurma) {
    colunas.push({
      id: "turma",
      header: "Turma",
      width: "10rem",
      hideBelow: "sm",
      cell: (l) => l.turmaNome ?? VAZIO,
      sortValue: (l) => l.turmaNome,
    });
  }

  colunas.push(
    {
      id: "status",
      header: "Status",
      width: "11rem",
      cell: (l) => {
        const { tone, label } = statusDaLinha(l);
        return <StatusBadge tone={tone} label={label} />;
      },
      sortValue: (l) => statusDaLinha(l).label,
    },
    {
      id: "aproveitamento",
      header: "Aproveitamento",
      width: "9rem",
      align: "right",
      cell: (l) => textoDoAproveitamento(l),
      // ⚠️ Ordena pelo número, não pelo texto: "9%" antes de "80%" senão.
      // E só quem tem leitura entra — os demais vão para o fim, como nulos.
      sortValue: (l) =>
        l.status === "completed" && typeof l.aproveitamentoGeral === "number"
          ? l.aproveitamentoGeral
          : null,
    },
    {
      id: "respondidas",
      header: "Respondidas",
      width: "8rem",
      align: "right",
      hideBelow: "md",
      cell: (l) => l.questoesRespondidas ?? VAZIO,
      sortValue: (l) => l.questoesRespondidas ?? null,
    },
    {
      id: "motivo",
      header: "Motivo",
      cell: (l) => (
        // ⚠️ Coluna própria, não texto dentro do badge: o pedido é que o
        // cursinho veja na linha do aluno que houve erro E qual foi. Truncar a
        // única informação acionável da linha derrota o propósito.
        <span className={cn("text-xs", dashV2.text.secondary)}>
          {l.falha?.descricao ?? ""}
        </span>
      ),
    },
  );

  return colunas;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/relatorioSimulado/`
Expected: PASS

- [ ] **Step 5: Provar que o teste discrimina**

Troque `if (linha.status !== "completed") return VAZIO;` por `if (false) return VAZIO;` e rode. Os testes de linha falha e de `awaiting_omr`/`pending`/`processing` têm que **falhar**. Reverta e confirme verde. Reporte o que viu.

- [ ] **Step 6: Commit**

```bash
git add src/pages/relatorioSimulado/colunas.tsx src/pages/relatorioSimulado/colunas.test.tsx
git commit -m "feat: colunas do relatorio, com a nota gateada por status"
```

---

## Task 4: O resumo

**Files:**
- Create: `src/pages/relatorioSimulado/ResumoDoRelatorio.tsx`
- Test: `src/pages/relatorioSimulado/ResumoDoRelatorio.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumoDoRelatorio } from "./ResumoDoRelatorio";
import type { ResumoDoRelatorio as Resumo } from "@/dtos/relatorioSimulado/relatorioSimulado";

const resumo = (over: Partial<Resumo> = {}): Resumo => ({
  totalNoRecorte: 30,
  comLeituraConcluida: 27,
  aproveitamentoGeral: 0.62,
  totalEstudantesComCartaoNoCursinho: 27,
  temEstudanteSemTurma: false,
  linhasSemEstudanteAtivo: 0,
  ...over,
});

describe("ResumoDoRelatorio", () => {
  it("⚠️ mostra as DUAS contagens — sem elas a média parece errada", () => {
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
  });

  it("média nula vira travessão, não 0%", () => {
    render(<ResumoDoRelatorio resumo={resumo({ aproveitamentoGeral: null })} />);

    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("⚠️ diz que o recorte é só cartão-resposta", () => {
    // sem isto, a primeira pergunta da semana é "cadê o fulano?" — quem
    // respondeu digital não entra neste relatório
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText(/cart[ãa]o-resposta/i)).toBeInTheDocument();
  });

  it("linhasSemEstudanteAtivo vira nota quando há", () => {
    render(<ResumoDoRelatorio resumo={resumo({ linhasSemEstudanteAtivo: 2 })} />);

    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/não estão mais/i)).toBeInTheDocument();
  });

  it("⚠️ e a nota SOME quando é zero — não escrever '0 estudantes saíram'", () => {
    render(<ResumoDoRelatorio resumo={resumo({ linhasSemEstudanteAtivo: 0 })} />);

    expect(screen.queryByText(/não estão mais/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/relatorioSimulado/ResumoDoRelatorio.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

```tsx
import { dashV2 } from "@/components/dashV2";
import type { ResumoDoRelatorio as Resumo } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className={cn("text-2xl font-semibold", dashV2.text.primary)}>
        {valor}
      </div>
      <div className={cn("text-xs", dashV2.text.muted)}>{rotulo}</div>
    </div>
  );
}

/**
 * ⚠️ **As duas contagens aparecem sempre.** Sem elas ninguém entende a
 * diferença entre "30 alunos" e "27 no cálculo", e a média parece errada.
 */
export function ResumoDoRelatorio({ resumo }: { resumo: Resumo }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-8">
        <Numero rotulo="Estudantes no recorte" valor={String(resumo.totalNoRecorte)} />
        <Numero
          rotulo="Com leitura concluída"
          valor={String(resumo.comLeituraConcluida)}
        />
        <Numero
          rotulo="Aproveitamento médio"
          // ⚠️ `null` vira travessão. "0%" afirmaria que a turma zerou.
          valor={
            resumo.aproveitamentoGeral === null
              ? "—"
              : `${Math.round(resumo.aproveitamentoGeral * 100)}%`
          }
        />
      </div>

      {/*
        ⚠️ Escrito na tela, não só no código. Um relatório que silenciosamente
        ignora quem respondeu online gera "cadê o fulano?" na primeira semana.
      */}
      <p className={cn("text-xs", dashV2.text.muted)}>
        Este relatório considera apenas quem respondeu por cartão-resposta. Quem
        resolveu o simulado pela plataforma não aparece aqui.
      </p>

      {/*
        ⚠️ Contado, NUNCA listado: o nome de quem saiu do cursinho não é
        informação que este relatório deva expor. Sem a nota, os totais não
        batem e a leitura natural é "o sistema perdeu cartão".
      */}
      {resumo.linhasSemEstudanteAtivo > 0 && (
        <p className={cn("text-xs", dashV2.text.muted)}>
          {resumo.linhasSemEstudanteAtivo} cartão(ões) enviado(s) por estudantes
          que não estão mais ativos nesta turma ou cursinho não aparecem na
          lista.
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/relatorioSimulado/ResumoDoRelatorio.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/relatorioSimulado/ResumoDoRelatorio.tsx src/pages/relatorioSimulado/ResumoDoRelatorio.test.tsx
git commit -m "feat: resumo do relatorio com as duas contagens"
```

---

## Task 5: A aba de questões

**Files:**
- Create: `src/pages/relatorioSimulado/TabelaDeQuestoes.tsx`
- Test: `src/pages/relatorioSimulado/TabelaDeQuestoes.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TabelaDeQuestoes } from "./TabelaDeQuestoes";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 5,
  questaoId: "q5",
  respondentes: 20,
  acertos: 12,
  erros: 6,
  semLeitura: 2,
  porAlternativa: { A: 12, B: 3, C: 2, D: 1, E: 0 },
  ...over,
});

describe("TabelaDeQuestoes", () => {
  it("mostra número, acertos, erros e sem leitura", () => {
    render(<TabelaDeQuestoes questoes={[questao()]} estado="idle" />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("⚠️ questão sem número não some da lista", () => {
    // um simulado com questão sem número nunca é liberado, mas o código não
    // pode presumir: sumir seria pior que aparecer fora de ordem
    render(<TabelaDeQuestoes questoes={[questao({ numero: null })]} estado="idle" />);

    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("mostra a distribuição por alternativa", () => {
    render(<TabelaDeQuestoes questoes={[questao()]} estado="idle" />);

    expect(screen.getByText(/A/)).toBeInTheDocument();
  });

  it("lista vazia mostra estado vazio, não tabela em branco", () => {
    render(<TabelaDeQuestoes questoes={[]} estado="idle" />);

    expect(screen.getByText(/nenhum/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/relatorioSimulado/TabelaDeQuestoes.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

```tsx
import {
  DashTable,
  DashTableVazio,
  dashV2,
  sortRows,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const ALTERNATIVAS = ["A", "B", "C", "D", "E"] as const;

const colunas: DashColumn<QuestaoDoRelatorio>[] = [
  {
    id: "numero",
    header: "Questão",
    width: "6rem",
    primary: true,
    // ⚠️ Questão sem número não some: vai para o fim (o `sortRows` manda nulo
    // para o fim nas duas direções) e mostra travessão.
    cell: (q) => q.numero ?? "—",
    sortValue: (q) => q.numero,
  },
  {
    id: "acertos",
    header: "Acertos",
    width: "6rem",
    align: "right",
    cell: (q) => q.acertos,
    sortValue: (q) => q.acertos,
  },
  {
    id: "erros",
    header: "Erros",
    width: "6rem",
    align: "right",
    cell: (q) => q.erros,
    sortValue: (q) => q.erros,
  },
  {
    id: "semLeitura",
    // ⚠️ "Sem leitura", não "Em branco": o ms-omr descarta questão em branco e
    // dupla marcação do mesmo jeito. Chamar de branco afirma o que ninguém
    // verificou — e é o número que o professor usa para decidir o que revisar.
    header: "Sem leitura",
    width: "7rem",
    align: "right",
    cell: (q) => q.semLeitura,
    sortValue: (q) => q.semLeitura,
  },
  {
    id: "distribuicao",
    header: "Por alternativa",
    cell: (q) => (
      <div className="flex gap-3">
        {ALTERNATIVAS.map((alt) => (
          <span key={alt} className={cn("text-xs", dashV2.text.secondary)}>
            <span className="font-medium">{alt}</span> {q.porAlternativa[alt] ?? 0}
          </span>
        ))}
      </div>
    ),
  },
];

export function TabelaDeQuestoes({
  questoes,
  estado,
  onRetry,
}: {
  questoes: QuestaoDoRelatorio[];
  estado: "idle" | "loading" | "error";
  onRetry?: () => void;
}) {
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "numero",
    direction: "asc",
  });

  // ⚠️ O `DashTable` não ordena sozinho — ele só avisa. Quem ordena é o
  // `sortRows`, que já trata nulos no fim e ordenação estável.
  const linhas = useMemo(() => sortRows(questoes, colunas, sort), [questoes, sort]);

  return (
    <DashTable<QuestaoDoRelatorio>
      rows={linhas}
      columns={colunas}
      rowKey={(q) => q.questaoId}
      sort={sort}
      onSortChange={setSort}
      state={estado}
      onRetry={onRetry}
      stickyHeader
      emptyState={
        <DashTableVazio titulo="Nenhuma questão com resposta ainda" />
      }
    />
  );
}
```

⚠️ **Confira a assinatura real de `DashTableVazio`** antes (`src/components/dashV2/DashTableEmpty.tsx`) — se as props tiverem outro nome, use os nomes de lá. Não invente prop.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/relatorioSimulado/TabelaDeQuestoes.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/relatorioSimulado/TabelaDeQuestoes.tsx src/pages/relatorioSimulado/TabelaDeQuestoes.test.tsx
git commit -m "feat: aba de questoes do relatorio"
```

---

## Task 6: A página e a rota

**Files:**
- Create: `src/pages/relatorioSimulado/index.tsx`
- Create: `src/pages/relatorioSimulado/voltar.ts`
- Modify: `src/routes/path.ts`
- Modify: `src/routes/PlatformRoutes.tsx`
- Test: `src/pages/relatorioSimulado/index.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RelatorioSimulado from "./index";

const buscarRelatorio = vi.hoisted(() => vi.fn());
const buscarQuestoes = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarRelatorio", () => ({
  buscarRelatorio,
  caminhoDoRelatorio: vi.fn(),
}));
vi.mock("@/services/relatorioSimulado/buscarQuestoes", () => ({ buscarQuestoes }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

const RESPOSTA = {
  linhas: [
    {
      usuario: "u1",
      nome: "Ana Silva",
      matricula: "2025001",
      turmaId: "t-1",
      turmaNome: "Turma A",
      enviouCartao: true,
      status: "completed",
      aproveitamentoGeral: 0.8,
      questoesRespondidas: 90,
    },
  ],
  resumo: {
    totalNoRecorte: 1,
    comLeituraConcluida: 1,
    aproveitamentoGeral: 0.8,
    totalEstudantesComCartaoNoCursinho: 1,
    temEstudanteSemTurma: false,
    linhasSemEstudanteAtivo: 0,
  },
};

const montar = (rota = "/relatorio-simulado/sim-1") =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/relatorio-simulado/:simuladoId" element={<RelatorioSimulado />} />
      </Routes>
    </MemoryRouter>,
  );

describe("RelatorioSimulado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA);
    buscarQuestoes.mockResolvedValue({ questoes: [] });
  });

  it("busca o relatório do simulado da URL", async () => {
    montar();

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith("tok", "sim-1", undefined),
    );
    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();
  });

  it("?turma= restringe o recorte", async () => {
    montar("/relatorio-simulado/sim-1?turma=t-9");

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith("tok", "sim-1", "t-9"),
    );
  });

  it("⚠️ NÃO busca as questões junto — só na primeira abertura da aba", async () => {
    montar();

    await screen.findByText("Ana Silva");
    expect(buscarQuestoes).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("tab", { name: /quest/i }));

    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));
  });

  it("voltar para a aba de estudantes e de novo para questões não rebusca", async () => {
    montar();
    await screen.findByText("Ana Silva");

    await userEvent.click(screen.getByRole("tab", { name: /quest/i }));
    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole("tab", { name: /estudante/i }));
    await userEvent.click(screen.getByRole("tab", { name: /quest/i }));

    expect(buscarQuestoes).toHaveBeenCalledTimes(1);
  });

  it("erro na busca mostra estado de erro, não tela em branco", async () => {
    buscarRelatorio.mockRejectedValue(new Error("caiu"));

    montar();

    expect(await screen.findByText(/erro/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/relatorioSimulado/index.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Criar o tipo do `location.state`**

`src/pages/relatorioSimulado/voltar.ts`:

```ts
/**
 * O que o relatório carrega para saber voltar.
 *
 * ⚠️ Não existe arte prévia de `location.state` neste repo — este é o primeiro
 * uso. O contrato mora aqui, e não inline nos dois lados, para as duas pontas
 * não divergirem em silêncio.
 */
export interface EstadoDeVolta {
  /** Para onde voltar. */
  caminho: string;
  /** Os filtros da listagem, para re-semear. */
  filtros: {
    nome: string;
    edicao: string;
    aplicacao: string;
    ano: string;
    gabaritoOnly: boolean;
  };
  /** Qual prova reabrir no `ShowProva`. */
  provaId: string;
  /** Em que página da listagem a pessoa estava. */
  pagina: number;
}

export interface LocationStateDoRelatorio {
  de?: EstadoDeVolta;
}
```

- [ ] **Step 4: Implementar a página**

`src/pages/relatorioSimulado/index.tsx`:

```tsx
import {
  DashTable,
  DashTableVazio,
  dashV2,
  sortRows,
  type SortState,
} from "@/components/dashV2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import type {
  LinhaDoRelatorio,
  QuestaoDoRelatorio,
  RelatorioDoSimulado,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { buscarQuestoes } from "@/services/relatorioSimulado/buscarQuestoes";
import { buscarRelatorio } from "@/services/relatorioSimulado/buscarRelatorio";
import { useAuthStore } from "@/store/auth";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { colunasDoRelatorio } from "./colunas";
import { ResumoDoRelatorio } from "./ResumoDoRelatorio";
import { TabelaDeQuestoes } from "./TabelaDeQuestoes";
import type { LocationStateDoRelatorio } from "./voltar";

type Estado = "idle" | "loading" | "error";

function RelatorioSimulado() {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const [searchParams] = useSearchParams();
  const turmaId = searchParams.get("turma") ?? undefined;
  const { data } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const de = (location.state as LocationStateDoRelatorio | null)?.de;

  const [relatorio, setRelatorio] = useState<RelatorioDoSimulado | null>(null);
  const [estado, setEstado] = useState<Estado>("loading");
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "estudante",
    direction: "asc",
  });

  const [aba, setAba] = useState("estudantes");
  const [questoes, setQuestoes] = useState<QuestaoDoRelatorio[] | null>(null);
  const [estadoQuestoes, setEstadoQuestoes] = useState<Estado>("idle");

  const carregar = () => {
    if (!simuladoId) return;
    setEstado("loading");
    buscarRelatorio(data.token, simuladoId, turmaId)
      .then((r) => {
        setRelatorio(r);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  };

  useEffect(carregar, [simuladoId, turmaId, data.token]);

  /**
   * ⚠️ As questões só são buscadas na PRIMEIRA abertura da aba, e nunca junto
   * com as linhas. São duas chamadas independentes e a maioria das visitas só
   * quer as linhas — buscar as duas sempre dobra o tempo até a primeira coisa
   * útil aparecer. O `questoes !== null` é o que impede rebuscar ao alternar.
   */
  const carregarQuestoes = () => {
    if (!simuladoId || questoes !== null) return;
    setEstadoQuestoes("loading");
    buscarQuestoes(data.token, simuladoId, turmaId)
      .then((r) => {
        setQuestoes(r.questoes);
        setEstadoQuestoes("idle");
      })
      .catch(() => setEstadoQuestoes("error"));
  };

  const colunas = useMemo(
    () => colunasDoRelatorio({ comTurma: turmaId !== undefined }),
    [turmaId],
  );

  const linhas = useMemo(
    () => sortRows(relatorio?.linhas ?? [], colunas, sort),
    [relatorio, colunas, sort],
  );

  const voltar = () => {
    if (de) {
      navigate(de.caminho, { state: { de } });
      return;
    }
    navigate(-1);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-4">
        {/* ⚠️ `print:hidden`: numa folha impressa não há "voltar". */}
        <button
          type="button"
          onClick={voltar}
          className={cn(
            "inline-flex w-fit items-center gap-2 text-sm print:hidden",
            dashV2.text.secondary,
            dashV2.focus,
          )}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </button>

        <h1 className={cn("text-xl font-semibold", dashV2.text.primary)}>
          Relatório do simulado
        </h1>

        {relatorio && <ResumoDoRelatorio resumo={relatorio.resumo} />}

        {estado === "error" && (
          <p className="text-sm text-red-600">
            Erro ao carregar o relatório.{" "}
            <button type="button" onClick={carregar} className="underline">
              Tentar de novo
            </button>
          </p>
        )}

        <Tabs
          value={aba}
          onValueChange={(v) => {
            setAba(v);
            if (v === "questoes") carregarQuestoes();
          }}
        >
          <TabsList className="print:hidden">
            <TabsTrigger value="estudantes">Estudantes</TabsTrigger>
            <TabsTrigger value="questoes">Questões</TabsTrigger>
          </TabsList>

          <TabsContent value="estudantes">
            <DashTable<LinhaDoRelatorio>
              rows={linhas}
              columns={colunas}
              rowKey={(l) => l.usuario}
              sort={sort}
              onSortChange={setSort}
              state={estado}
              onRetry={carregar}
              stickyHeader
              emptyState={
                <DashTableVazio titulo="Nenhum estudante neste recorte" />
              }
            />
          </TabsContent>

          <TabsContent value="questoes">
            <TabelaDeQuestoes
              questoes={questoes ?? []}
              estado={estadoQuestoes}
              onRetry={() => {
                setQuestoes(null);
                carregarQuestoes();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

export default RelatorioSimulado;
```

⚠️ **Confira antes:** o caminho real do store de auth (`@/store/auth` ou outro) e a forma de ler o token — siga exatamente o que `partnerPrepProvas/index.tsx` faz. E confira a assinatura de `DashTableVazio`.

⚠️ `onRetry` das questões zera `questoes` antes de rebuscar, senão a guarda `questoes !== null` impede o retry.

- [ ] **Step 5: Declarar a rota**

Em `src/routes/path.ts`, junto das outras constantes de dash:

```ts
export const RELATORIO_SIMULADO = "relatorio-simulado";
```

Em `src/routes/PlatformRoutes.tsx` — importe `RELATORIO_SIMULADO` de `./path`, importe a página, e acrescente a rota junto das outras do dashboard:

```tsx
        <Route
          path={`${RELATORIO_SIMULADO}/:simuladoId`}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.gerenciarEstudantes]}
            >
              <RelatorioSimulado />
            </ProtectedRoutePermission>
          }
        />
```

⚠️ **Limitação conhecida, não consertar aqui:** `ProtectedRoutePermission` é `<Navigate to={DASH} replace />` — quem não tem a permissão é redirecionado **calado**. Isso é o card `10`.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/relatorioSimulado/`
Expected: PASS

- [ ] **Step 7: Build e commit**

```bash
npm run build
git add src/pages/relatorioSimulado/index.tsx src/pages/relatorioSimulado/index.test.tsx src/pages/relatorioSimulado/voltar.ts src/routes/path.ts src/routes/PlatformRoutes.tsx
git commit -m "feat: pagina e rota do relatorio do simulado"
```

---

## Task 7: A ação no modal, ligada só por uma tela

⚠️ **O `simuladosView` é compartilhado.** `partnerPrepProvas/index.tsx:26` importa o `ShowProva` do `dashProvas`, e o `showProva.tsx` renderiza o `SimuladosView`. Uma ação acrescentada ali **aparece nas duas telas por padrão** — e na `dashprovas` o usuário pode não ter cursinho, o que faria a api devolver 403.

O interruptor é **a tela**, via prop. Não a permissão: `gerenciarEstudantes` pode existir para um admin de plataforma.

**Files:**
- Modify: `src/pages/dashProvas/modals/simuladosView.tsx`
- Modify: `src/pages/dashProvas/modals/showProva.tsx`
- Modify: `src/pages/partnerPrepProvas/index.tsx`
- Test: `src/pages/dashProvas/modals/simuladosView.test.tsx` (existe? se não, criar)

- [ ] **Step 1: Escrever os testes que falham**

Acrescente ao spec do `simuladosView` (crie o arquivo se não existir, seguindo o padrão de mock de `src/pages/dashProvas/index.test.tsx`):

```tsx
const buscarSimuladosComCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao,
}));

const SIMULADO = {
  _id: "sim-1",
  nome: "ENEM 2024",
  categoria: { nome: "ENEM", quantidadeTotalQuestao: 90 },
  questoes: [],
  bloqueado: false,
};

const props = (over = {}) => ({
  simulados: [SIMULADO],
  loading: false,
  error: null,
  token: "tok",
  onVoltar: vi.fn(),
  onRetry: vi.fn(),
  onSimuladoUpdated: vi.fn(),
  ...over,
});

describe("SimuladosView — a ação de relatório", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [{ simuladoId: "sim-1", nome: "ENEM 2024", cartoes: 3, comLeituraConcluida: 2, ultimoEnvio: null }],
    });
  });

  it("⚠️ SEM a prop `relatorio`, a ação NÃO existe — é a tela do admin", async () => {
    // o simuladosView é compartilhado: sem interruptor explícito a ação
    // apareceria também na dashprovas, onde a api devolveria 403
    render(<SimuladosView {...props()} />);

    expect(
      screen.queryByRole("button", { name: /relat[óo]rio/i }),
    ).not.toBeInTheDocument();
  });

  it("⚠️ e sem a prop o serviço do 04b nem é chamado", async () => {
    // chamar sem cursinho devolveria 403 no console, sem propósito nenhum
    render(<SimuladosView {...props()} />);

    await waitFor(() => expect(buscarSimuladosComCartao).not.toHaveBeenCalled());
  });

  it("com a prop, a ação aparece e chama o callback com o simulado", async () => {
    const aoAbrir = vi.fn();
    render(
      <SimuladosView {...props({ relatorio: { aoAbrir, permitido: true } })} />,
    );

    const botao = await screen.findByRole("button", { name: /relat[óo]rio/i });
    await userEvent.click(botao);

    expect(aoAbrir).toHaveBeenCalledWith(expect.objectContaining({ _id: "sim-1" }));
  });

  it("simulado sem cartão: ação desabilitada e o clique não passa", async () => {
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [] });
    const aoAbrir = vi.fn();
    render(
      <SimuladosView {...props({ relatorio: { aoAbrir, permitido: true } })} />,
    );

    const botao = await screen.findByRole("button", { name: /nenhum cart/i });
    await userEvent.click(botao);

    // ⚠️ `AcaoIcone` usa aria-disabled, não `disabled` — o clique CHEGA, e
    // quem barra é a guarda interna. Tirar a guarda reabre a ação sem aviso.
    expect(botao).toHaveAttribute("aria-disabled", "true");
    expect(aoAbrir).not.toHaveBeenCalled();
  });

  it("sem gerenciarEstudantes: desabilitada com motivo, e o 04b não é chamado", async () => {
    const aoAbrir = vi.fn();
    render(
      <SimuladosView {...props({ relatorio: { aoAbrir, permitido: false } })} />,
    );

    expect(
      await screen.findByRole("button", { name: /permiss/i }),
    ).toBeInTheDocument();
    expect(buscarSimuladosComCartao).not.toHaveBeenCalled();
  });
});
```

⚠️ **Um `render` por teste, e cada um verifica tudo de uma vez.** Radix Tooltip no jsdom é caro neste projeto (~51s para 22 testes no `DashToolbar.test.tsx`, causa desconhecida, custo vaza entre testes). Não multiplique montagens.

⚠️ `SimuladosView` precisa de um `TooltipProvider` em volta nos testes se não o tiver internamente — confira o arquivo (ele importa `TooltipProvider`, então provavelmente já embrulha).

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/pages/dashProvas/modals/simuladosView.test.tsx`
Expected: FAIL — a prop `relatorio` não existe.

- [ ] **Step 3: Implementar no `simuladosView.tsx`**

Acrescente o tipo e a prop:

```tsx
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { buscarSimuladosComCartao } from "@/services/relatorioSimulado/buscarSimuladosComCartao";

/**
 * Liga a ação de relatório.
 *
 * ⚠️ **A presença desta prop é o interruptor por TELA**, e é de propósito. O
 * `simuladosView` é compartilhado entre `dashprovas` (admin) e
 * `cursinho-provas`; sem um interruptor explícito a ação apareceria nas duas,
 * e o admin de plataforma — que não tem cursinho — tomaria 403 do card `04`.
 *
 * ⚠️ **Permissão não serve de interruptor:** `gerenciarEstudantes` pode existir
 * para um admin. Por isso são dois campos, não um.
 */
export interface AcaoRelatorio {
  aoAbrir: (simulado: SimuladoResumo) => void;
  /** `gerenciarEstudantes`. Falso = desabilitada com motivo, e sem chamar o ms. */
  permitido: boolean;
}
```

Acrescente `relatorio?: AcaoRelatorio;` ao `SimuladosViewProps` e ao destructuring do componente.

Dentro do componente, o lookup do `04b`:

```tsx
  const [cartoesPorSimulado, setCartoesPorSimulado] = useState<
    Map<string, number> | null
  >(null);

  /**
   * ⚠️ Só busca quando a ação está ligada **e** permitida. Na `dashprovas` o
   * usuário pode não ter cursinho, e sem `gerenciarEstudantes` a rota devolve
   * 403 — chamar nesses casos é um erro no console sem propósito nenhum.
   */
  useEffect(() => {
    if (!relatorio?.permitido) return;
    let cancelado = false;
    buscarSimuladosComCartao(token)
      .then((r) => {
        if (cancelado) return;
        setCartoesPorSimulado(
          new Map(r.simulados.map((s) => [s.simuladoId, s.cartoes])),
        );
      })
      // Silencioso de propósito: falhar em saber quais têm cartão não pode
      // derrubar o modal, que serve para outras quatro ações.
      .catch(() => {
        if (!cancelado) setCartoesPorSimulado(new Map());
      });
    return () => {
      cancelado = true;
    };
  }, [relatorio?.permitido, token]);
```

E a ação, dentro do `<div className="flex items-center justify-end gap-1">`, depois do `AcaoIcone` de editar janela:

```tsx
                      {relatorio && (
                        <AcaoIcone
                          icone={ChartBarIcon}
                          rotulo="Ver relatório do cartão-resposta"
                          onClick={() => relatorio.aoAbrir(simulado)}
                          desabilitado={
                            !relatorio.permitido ||
                            (cartoesPorSimulado?.get(simulado._id) ?? 0) === 0
                          }
                          motivoDesabilitado={
                            !relatorio.permitido
                              ? "Você não tem permissão para ver o desempenho dos estudantes"
                              : "Nenhum cartão-resposta enviado para este simulado"
                          }
                        />
                      )}
```

⚠️ Enquanto `cartoesPorSimulado` é `null` (carregando), `?? 0` deixa a ação desabilitada — que é o certo: melhor desabilitada por um instante que habilitada para abrir uma tela vazia.

- [ ] **Step 4: Repassar pelo `showProva.tsx`**

Acrescente `relatorio?: AcaoRelatorio;` ao `ShowProvaProps`, ao destructuring, e passe adiante no `<SimuladosView ... relatorio={relatorio} />`.

- [ ] **Step 5: Ligar na `partnerPrepProvas`**

No `ModalShowProva` de `src/pages/partnerPrepProvas/index.tsx`, acrescente ao `<ShowProva ...>`:

```tsx
        relatorio={{
          permitido: !!permissao[Roles.gerenciarEstudantes],
          aoAbrir: (simulado) => abrirRelatorio(simulado._id),
        }}
```

E o `abrirRelatorio` — por ora só a navegação simples; o `state` entra na Task 9:

```tsx
  const abrirRelatorio = (simuladoId: string) => {
    navigate(`${DASH}/${RELATORIO_SIMULADO}/${simuladoId}`);
  };
```

⚠️ **Não ligue na `dashProvas/index.tsx`.** É o ponto do card, e há teste cobrando.

⚠️ Confira como a tela lê `permissao` (ela já usa `useAuthStore`) e importe `useNavigate`, `DASH` e `RELATORIO_SIMULADO`.

- [ ] **Step 6: Rodar e confirmar que passam**

Run: `npx vitest run src/pages/dashProvas src/pages/partnerPrepProvas`
Expected: PASS

- [ ] **Step 7: Provar que o teste discrimina**

Troque `{relatorio && (` por `{true && (` no `simuladosView.tsx` e rode. O teste *"SEM a prop `relatorio`, a ação NÃO existe"* tem que **falhar**. Reverta e confirme verde. Reporte o que viu.

- [ ] **Step 8: Commit**

```bash
git add src/pages/dashProvas/modals/simuladosView.tsx src/pages/dashProvas/modals/simuladosView.test.tsx src/pages/dashProvas/modals/showProva.tsx src/pages/partnerPrepProvas/index.tsx
git commit -m "feat: acao de relatorio no modal, ligada so pela tela do cursinho"
```

---

## Task 8: `paginaInicial` no `DashListTemplate`, com o guard do clamp

⚠️ **Mudança em componente compartilhado.** O `DashListTemplate` serve `dashProvas` **e** `partnerPrepProvas`. As duas props são **aditivas** e o default fica idêntico ao de hoje — nada de inverter o controle da paginação.

⚠️ **E isto não é o card de paginação server-side** que o README do dashV2 lista como pendência. Aquele é outro problema: filtro e ordenação no backend. Este é estado de navegação, em memória.

**Files:**
- Modify: `src/components/dashV2/DashListTemplate.tsx`
- Test: `src/components/dashV2/DashListTemplate.test.tsx`

- [ ] **Step 1: Escrever os testes que falham**

Acrescente ao spec existente. **Leia antes como o arquivo monta o Provider** e reuse esse helper.

```tsx
  it("paginaInicial abre na página pedida", () => {
    // 60 registros, 25 por página → 3 páginas
    montar({ entities: muitasEntidades(60), paginaInicial: 3 });

    expect(screen.getByText(/51[–-]60/)).toBeInTheDocument();
  });

  it("sem paginaInicial o comportamento é o de hoje: página 1", () => {
    montar({ entities: muitasEntidades(60) });

    expect(screen.getByText(/1[–-]25/)).toBeInTheDocument();
  });

  it("⚠️ paginaInicial sobrevive ao render com a lista ainda carregando", () => {
    // A linha do clamp roda DURANTE o render, e `totalDePaginas(0, n)` devolve
    // 1 (`paginacao.ts` garante "nunca zero"). Sem o guard por `state`, a
    // página restaurada é zerada antes de as linhas chegarem — e o teste acima
    // passa mesmo assim, porque lá a lista já está cheia no primeiro render.
    const { rerender } = montar({
      entities: [],
      paginaInicial: 3,
      state: "loading",
    });

    rerender(comProvider({ entities: muitasEntidades(60), paginaInicial: 3, state: "idle" }));

    expect(screen.getByText(/51[–-]60/)).toBeInTheDocument();
  });

  it("onPaginaChange avisa quem montou", async () => {
    const onPaginaChange = vi.fn();
    montar({ entities: muitasEntidades(60), onPaginaChange });

    await userEvent.click(screen.getByRole("button", { name: /pr[óo]xima/i }));

    expect(onPaginaChange).toHaveBeenCalledWith(2);
  });

  it("o clamp continua valendo quando a lista encolhe de verdade", () => {
    // a rede de segurança original não pode ter sido desligada junto
    const { rerender } = montar({ entities: muitasEntidades(60), paginaInicial: 3 });

    rerender(comProvider({ entities: muitasEntidades(10), paginaInicial: 3, state: "idle" }));

    expect(screen.getByText(/1[–-]10/)).toBeInTheDocument();
  });
```

⚠️ **Adapte `montar`/`comProvider`/`muitasEntidades` aos helpers que o arquivo já tem** — não reescreva os dele. Se o rótulo do botão de próxima página for outro, use o real. Se o formato do intervalo no rodapé for diferente de `51–60`, ajuste a regex ao que o `intervaloDaPagina` produz.

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/components/dashV2/DashListTemplate.test.tsx`
Expected: FAIL — `paginaInicial` não existe; o teste do "carregando" falha mesmo depois de a prop existir, até o guard entrar.

- [ ] **Step 3: Implementar**

Em `DashListTemplateProps`, acrescente:

```ts
  /**
   * Página em que a lista abre. Ausente = 1, como sempre foi.
   *
   * ⚠️ **Não é controle invertido.** O template continua dono da paginação;
   * isto só semeia o estado inicial. Existe para o "voltar" do relatório de
   * simulado devolver a pessoa à página em que ela estava.
   */
  paginaInicial?: number;
  /** Avisa quem montou a cada troca de página, para ele poder guardar. */
  onPaginaChange?: (pagina: number) => void;
```

Troque a linha 226:

```ts
  const [pagina, setPagina] = useState(paginaInicial ?? 1);
```

E o clamp (linha ~265):

```ts
  const paginas = totalDePaginas(linhas.length, pageSize);
  /**
   * ⚠️ Rede de segurança para o filtro que o template não intercepta: se o
   * conjunto encolheu, a página corrente pode não existir mais.
   *
   * ⚠️ **Mas não enquanto carrega.** Com `entities` vazio, `totalDePaginas`
   * devolve 1 (ele garante "nunca zero"), e sem esta guarda uma
   * `paginaInicial` restaurada seria zerada **antes** das linhas chegarem —
   * o "voltar" devolveria a pessoa à página 1 em silêncio.
   */
  if (state !== "loading" && pagina > paginas) setPagina(paginas);
  const paginaAtual = Math.min(pagina, paginas);
```

E notifique quem montou. **Não** chame `onPaginaChange` dentro do render — envolva as trocas:

```ts
  const irParaPagina = (nova: number) => {
    setPagina(nova);
    onPaginaChange?.(nova);
  };
```

Use `irParaPagina` onde hoje o rodapé chama `setPagina`, e mantenha `voltarParaPrimeiraPagina` como está (ele é reset por filtro, não navegação do usuário — mas se o teste pedir, avise também).

⚠️ **Leia o arquivo antes de trocar:** `setPagina` aparece em mais de um lugar (reset por filtro, clamp, rodapé). Só a troca **pelo rodapé** deve notificar.

- [ ] **Step 4: Rodar e confirmar que passam**

Run: `npx vitest run src/components/dashV2/`
Expected: PASS — **e todos os testes que já existiam também**. Reporte o total antes e depois.

- [ ] **Step 5: Provar que o guard é necessário**

Tire o `state !== "loading" &&` e rode. O teste *"paginaInicial sobrevive ao render com a lista ainda carregando"* tem que **falhar**. Restaure e confirme verde. Reporte o que viu — este é o ponto inteiro da task.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashV2/DashListTemplate.tsx src/components/dashV2/DashListTemplate.test.tsx
git commit -m "feat: paginaInicial e onPaginaChange no DashListTemplate"
```

---

## Task 9: O "voltar" que devolve ao lugar certo

**Files:**
- Modify: `src/pages/partnerPrepProvas/index.tsx`
- Test: `src/pages/partnerPrepProvas/index.test.tsx`

- [ ] **Step 1: Escrever os testes que falham**

```tsx
  it("abrir o relatório leva os filtros, a prova e a página no state", async () => {
    montarComState(null);
    await screen.findByText("ENEM 2024");

    // abre o ShowProva clicando na linha da prova, vai para a aba de simulados,
    // e clica na ação de relatório
    await userEvent.click(screen.getByText("ENEM 2024"));
    await userEvent.click(await screen.findByRole("button", { name: /simulados/i }));
    await userEvent.click(
      await screen.findByRole("button", { name: /relat[óo]rio/i }),
    );

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-1"),
      expect.objectContaining({
        state: {
          de: expect.objectContaining({
            provaId: expect.any(String),
            pagina: expect.any(Number),
            filtros: expect.any(Object),
          }),
        },
      }),
    );
  });

  it("voltar com state restaura os cinco filtros", async () => {
    montarComState({
      de: {
        caminho: "/dashboard/cursinho-provas",
        filtros: { nome: "ENEM", edicao: "2", aplicacao: "1", ano: "2024", gabaritoOnly: true },
        provaId: "p-1",
        pagina: 2,
      },
    });

    expect(await screen.findByDisplayValue("ENEM")).toBeInTheDocument();
  });

  it("⚠️ reabrir o modal espera a lista chegar", async () => {
    // `onClickCard` faz `provas.find(...)`; restaurar no mount com `provas`
    // vazio acha undefined e o `provaSelected!` do ModalShowProva estoura
    montarComState({
      de: {
        caminho: "/dashboard/cursinho-provas",
        filtros: { nome: "", edicao: "TODAS", aplicacao: "TODAS", ano: "TODOS", gabaritoOnly: false },
        provaId: "p-1",
        pagina: 1,
      },
    });

    expect(await screen.findByTestId("modal-show-prova")).toBeInTheDocument();
  });

  it("⚠️ o state é consumido UMA vez só", async () => {
    // sem limpar, um navigate posterior para a mesma rota ressuscita filtros
    // velhos que a pessoa já tinha trocado
    montarComState({
      de: {
        caminho: "/dashboard/cursinho-provas",
        filtros: {
          nome: "",
          edicao: "TODAS",
          aplicacao: "TODAS",
          ano: "TODOS",
          gabaritoOnly: false,
        },
        provaId: "p-1",
        pagina: 1,
      },
    });

    await screen.findByTestId("modal-show-prova");

    expect(navigate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ replace: true, state: null }),
    );
  });
```

⚠️ **Adapte ao que o `index.test.tsx` da tela já monta** (ele mocka os serviços e o `useAuthStore`). Você vai precisar de dois helpers, e de mockar o router:

```tsx
const navigate = vi.hoisted(() => vi.fn());
const estadoDaLocation = vi.hoisted(() => ({ atual: null as unknown }));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
  useLocation: () => ({ pathname: "/dashboard/cursinho-provas", state: estadoDaLocation.atual }),
}));

const montarComState = (state: unknown) => {
  estadoDaLocation.atual = state;
  return render(<PartnerPrepProvas />);
};
```

⚠️ `importOriginal` preserva `MemoryRouter` e o resto — sem ele, o `render` da tela quebra por falta do contexto do router.

⚠️ O nome exato dos rótulos dos botões (`/simulados/i`, `/relat[óo]rio/i`, a linha da prova) sai do que os componentes realmente renderizam. **Leia antes de assumir**; se o alvo não existir com esse nome, use o que existe — não mude o componente para caber no teste.

⚠️ O `data-testid="modal-show-prova"` provavelmente não existe: acrescente-o ao stub do `ShowProva` no mock do teste, não ao componente de produção.

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/pages/partnerPrepProvas/index.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Saindo — troque o `abrirRelatorio` da Task 7:

```tsx
  const abrirRelatorio = (simuladoId: string) => {
    const de: EstadoDeVolta = {
      caminho: `${DASH}/${PARTNER_PROVAS}`,
      filtros: {
        nome: nameFilter,
        edicao: edicaoFilter,
        aplicacao: aplicacaoFilter,
        ano: anoFilter,
        gabaritoOnly,
      },
      provaId: provaSelected!._id,
      pagina: paginaAtual,
    };
    navigate(`${DASH}/${RELATORIO_SIMULADO}/${simuladoId}`, { state: { de } });
  };
```

Guardando a página corrente (é para isso que serve o `onPaginaChange` da Task 8):

```tsx
  const [paginaAtual, setPaginaAtual] = useState(1);
```

e no `DashListTemplate`: `paginaInicial={paginaRestaurada}` e `onPaginaChange={setPaginaAtual}`.

Voltando — no topo do componente:

```tsx
  const location = useLocation();
  const de = (location.state as LocationStateDoRelatorio | null)?.de;

  /**
   * ⚠️ Os filtros voltam no PRIMEIRO render, via inicializador do `useState`,
   * e não num `useEffect`. Com efeito, a tela pinta uma vez sem filtro, busca,
   * e só então filtra — a pessoa vê a lista inteira piscar.
   */
  const [nameFilter, setNameFilter] = useState<string>(de?.filtros.nome ?? "");
  // ...idem para os outros quatro...
  const [paginaRestaurada] = useState(de?.pagina ?? 1);
```

O modal, **depois** da lista chegar:

```tsx
  /**
   * ⚠️ **Espera a lista.** `onClickCard` faz `provas.find(...)`; restaurar no
   * mount, com `provas` vazio, acha `undefined` e o `provaSelected!` do
   * `ModalShowProva` estoura.
   *
   * ⚠️ E o `ref` faz isto rodar **uma vez só**: sem ele, reabrir o modal
   * depois de a pessoa fechá-lo viraria um laço.
   */
  const jaRestaurou = useRef(false);
  useEffect(() => {
    if (jaRestaurou.current || !de || provas.length === 0) return;
    jaRestaurou.current = true;

    const prova = provas.find((p) => p._id === de.provaId);
    if (prova) {
      setProvaSelected(prova);
      modals.modalShowProva.open();
    }

    // ⚠️ Consumir o state, senão um `navigate` posterior para esta rota
    // ressuscita filtros velhos que a pessoa já trocou.
    navigate(location.pathname, { replace: true, state: null });
  }, [de, provas, navigate, location.pathname, modals]);
```

- [ ] **Step 4: Rodar e confirmar que passam**

Run: `npx vitest run src/pages/partnerPrepProvas/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/partnerPrepProvas/index.tsx src/pages/partnerPrepProvas/index.test.tsx
git commit -m "feat: voltar do relatorio restaura filtros, pagina e modal"
```

---

## Task 10: Impressão

⚠️ **Não existe `@media print` nenhum no repo** — nem `window.print`, nem folha de impressão, nem uso da variante `print:` do Tailwind. É a primeira.

**Files:**
- Modify: `src/components/organisms/header/index.tsx` (ou onde o `Header` renderiza a raiz)
- Modify: o componente do sidebar da dash (`SidebarDash`)
- Modify: `src/components/templates/dashTemplate/index.tsx`
- Test: `src/pages/relatorioSimulado/impressao.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

⚠️ **jsdom não aplica `@media print`.** O teste não pode verificar o efeito visual — verifica que as **classes** estão lá, que é o que se pode afirmar em processo. A verificação visual real é gate manual, registrado no PR.

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "@/components/organisms/header";

describe("impressão", () => {
  it("o header sai da folha impressa", () => {
    // ⚠️ jsdom não avalia @media print: o que dá para afirmar aqui é que a
    // classe existe. O resultado visual é gate manual no PR.
    const { container } = render(<Header />);

    expect(container.querySelector(".print\\:hidden")).toBeTruthy();
  });
});
```

⚠️ **Confira as props obrigatórias do `Header`** antes — ele pode exigir `solid`/`className`. Passe o mínimo.

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/relatorioSimulado/impressao.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Acrescente `print:hidden` à className raiz do `Header` e do sidebar da dash, e zere o offset no `dashTemplate`:

```tsx
    <div className="relative top-[76px] h-[calc(100vh-76px)] w-full flex flex-row print:top-0 print:h-auto print:block">
```

⚠️ **Não unifique o 76px num token agora.** Ele está repetido em `baseTemplate`, `dashTemplate` e `DashListTemplate`; unificar é refactor de outro assunto, e mexer nos três dentro deste PR esconde a mudança na revisão.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/relatorioSimulado/ src/components`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add <os arquivos tocados>
git commit -m "feat: esconde navegacao na impressao do relatorio"
```

---

## Fechamento

```bash
npx vitest run
npm run build
ESLINT_USE_FLAT_CONFIG=false npx eslint src/pages/relatorioSimulado src/services/relatorioSimulado src/dtos/relatorioSimulado src/components/dashV2/DashListTemplate.tsx src/pages/dashProvas/modals src/pages/partnerPrepProvas
```

⚠️ **Gate manual, para registrar no PR** — jsdom não alcança:

1. Imprimir o relatório (Ctrl+P) e conferir que header e sidebar somem
2. A ação desabilitada num simulado sem cartão, e o tooltip abrindo com o motivo
3. Voltar do relatório com filtro e página 3 ativos, e conferir que os três voltam
4. Abrir a `dashprovas` como admin e conferir que **não** há ação de relatório
