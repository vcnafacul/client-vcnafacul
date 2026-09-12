# Caderno · Overleaf — Card 06: botão no client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pôr o botão que o coordenador clica para baixar o caderno — o último elo da POC.

**Architecture:** Um service novo (`baixarCaderno`) espelhando a pasta do cartão mas via `fetchWrapper`, e três botões condicionais na coluna de ações do `SimuladosView`.

**Tech Stack:** React 19 + Vite 6, TypeScript, `@heroicons/react`, `react-toastify` 11. **Nenhuma dependência nova.**

**Spec:** `docs/superpowers/specs/2026-09-12-caderno-overleaf-client-botao-design.md`

---

## Contexto que o plano assume

**O backend está pronto e mergeado.** `GET mssimulado/caderno/:simuladoId?draft=true`, atrás de
`visualizar_provas`, devolve o zip com `Content-Disposition: attachment` e o header
`X-Caderno-Avisos`. Erros chegam com a mensagem legível — o card 05 gastou uma task inteira nisso.

⚠️ **Este projeto não tem testes.** Medido: nenhum runner nas dependências, nenhuma config, nenhum
arquivo `.test.`/`.spec.` no `src/`, e o único script de verificação é `lint`.

Isso muda como este plano se verifica. Não há passo "escreva o teste que falha"; há
`lint` + `tsc` + `build` a cada task, e um **gate manual que não é opcional** — é a única prova de
comportamento. Introduzir `vitest` **não** entra aqui: é decisão de projeto, não de um card que
acrescenta um botão.

## Restrições do repo

- ⚠️ **`npm run lint` está QUEBRADO neste repo, e é pré-existente.** ESLint 9 instalado, config em
  `.eslintrc.cjs` (formato legado que a v9 não lê), script usando `--ext` (removido na v9), e nenhum CI
  rodando lint. Falha igual na `develop`. Rodando por compatibilidade, o repo tem **155 problemas**
  pré-existentes. **Não conserte isso** — é tarefa de projeto. Lint só os seus arquivos:
  `ESLINT_USE_FLAT_CONFIG=false npx eslint <caminhos>`.
- ⚠️ **Nunca** `git add -A` nem `git add .`.
- Branch `feature/caderno-06-client-botao`, criada de `poc/caderno-overleaf`, que saiu da `develop`. Commits autônomos liberados.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/services/urls.ts` | **modificado**: exporta `caderno` |
| `src/services/caderno/baixarCaderno.ts` | chama a api, lê o header de avisos, propaga a mensagem de erro |
| `src/pages/dashProvas/modals/simuladosView.tsx` | **modificado**: os botões e o handler |
| `.env.example` | **modificado**: `VITE_CADERNO_DRAFT` |

---

### Task 1: O service

**Files:**
- Modify: `src/services/urls.ts`
- Create: `src/services/caderno/baixarCaderno.ts`
- Modify: `.env.example`

- [ ] **Step 1: A URL**

Em `src/services/urls.ts`, ao lado de `cartaoResposta` (linha ~63):

```ts
export const caderno = `${mssimulado}/caderno`;
```

- [ ] **Step 2: O service**

Criar `src/services/caderno/baixarCaderno.ts`:

```ts
import { caderno } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * Baixa o zip do caderno de questões.
 *
 * ⚠️ Usa `fetchWrapper`, e não `fetch` cru como o `baixarCartao` ao lado. O
 * wrapper renova o token expirado e refaz a chamada; sem ele, um token vencido
 * vira `401` e o usuário lê "erro ao baixar" sem saber que bastava recarregar
 * a página.
 *
 * Vale mais aqui do que no cartão: gerar o caderno é mais lento — ele resolve
 * as imagens, e as externas passam por rede de terceiro — então há mais janela
 * para o token virar no meio. E os outros dois serviços da pasta do cartão
 * (`uploadCartao`, `buscarResultados`) já usam o wrapper.
 */
export async function baixarCaderno(
  simuladoId: string,
  token: string,
  draft = false,
): Promise<{ blob: Blob; avisos: number }> {
  const response = await fetchWrapper(
    `${caderno}/${simuladoId}${draft ? "?draft=true" : ""}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // ⚠️ Sucesso é binário, erro é JSON, e o corpo só pode ser lido UMA vez.
  // A decisão é pelo `response.ok`, antes de tocar no corpo: ler o errado
  // consome o stream e o download quebra.
  if (!response.ok) {
    throw new Error(await mensagemDoErro(response));
  }

  const avisos = Number(response.headers.get("X-Caderno-Avisos") ?? 0);
  return { blob: await response.blob(), avisos: Number.isNaN(avisos) ? 0 : avisos };
}

/**
 * A mensagem que o backend mandou, ou uma genérica.
 *
 * ⚠️ O `try/catch` não é cerimônia: um `502` de proxy reverso devolve HTML, e
 * um `.json()` solto lançaria `SyntaxError` — trocando a mensagem útil por
 * "Unexpected token <".
 *
 * ⚠️ Propagar a mensagem do backend é o ponto. O card 05 gastou uma task
 * inteira para o `409` chegar legível até aqui ("simulado não está pronto…");
 * descartá-la e mostrar "erro ao baixar" anula aquele trabalho.
 */
async function mensagemDoErro(response: Response): Promise<string> {
  try {
    const corpo = await response.json();
    if (typeof corpo?.message === "string" && corpo.message.trim()) {
      return corpo.message;
    }
  } catch {
    // corpo vazio ou não-JSON: cai na genérica
  }
  return "Não foi possível baixar o caderno";
}
```

⚠️ **Confira como os imports são escritos neste arquivo vizinho.** O `baixarCartao.ts` usa
`@/services/urls`; o `simuladosView.tsx` usa caminho relativo. Siga o padrão de **cada** arquivo, não
um só.

⚠️ `X-Caderno-Avisos` lido com `response.headers.get(...)`, que é **case-insensitive** por especificação
— diferente do acesso por índice, que mordeu no card 05.

⚠️ **Sem `credentials: "include"` aqui**, diferente do `baixarCartao`: o `fetchWrapper` já força
`credentials: "include"` em toda chamada (`fetchWrapper.ts:132-135`). Repetir sugeriria ao próximo
leitor que é escolha deste service, quando é do wrapper.

- [ ] **Step 3: A env**

Em `.env.example`:

```
# Caderno (POC Overleaf) — mostra o botão de rascunho em simulado bloqueado
VITE_CADERNO_DRAFT=false
```

- [ ] **Step 4: Verificar**

```bash
npx tsc --noEmit
ESLINT_USE_FLAT_CONFIG=false npx eslint src/services/urls.ts src/services/caderno/baixarCaderno.ts
```

Esperado: os dois limpos, nos **seus** arquivos.

- [ ] **Step 5: Commit**

```bash
git add src/services/urls.ts src/services/caderno/baixarCaderno.ts .env.example
git commit -m "$(cat <<'EOF'
feat(caderno): service de download do caderno

Usa fetchWrapper, nao fetch cru como o baixarCartao ao lado: renova token
expirado e refaz a chamada. Vale mais aqui porque gerar o caderno e mais
lento -- resolve imagens, as externas por rede de terceiro -- entao ha
mais janela pro token virar no meio.

Propaga a MENSAGEM do backend no erro. O card 05 gastou uma task inteira
pro 409 chegar legivel ate aqui; mostrar "erro ao baixar" anularia aquilo.

Sucesso e binario e erro e JSON, e o corpo so pode ser lido uma vez: a
decisao e pelo response.ok, antes de tocar no corpo.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PrN5kdVC3BqJMYTGnEL9K7
EOF
)"
```

---

### Task 2: Os botões

**Files:**
- Modify: `src/pages/dashProvas/modals/simuladosView.tsx`

Leia o arquivo inteiro antes. O `handleDownloadCartao` (linhas ~62-90) e o botão dele (~165-181) são
o molde — e as diferenças em relação a eles são deliberadas.

- [ ] **Step 1: O estado do download em voo**

```ts
  // ⚠️ Guarda o `_id` em voo, não um booleano. Um booleano único desabilitaria
  // a tabela INTEIRA, e o coordenador que quer baixar dois simulados
  // esperaria sem motivo.
  const [baixandoCaderno, setBaixandoCaderno] = useState<string | null>(null);

  // Botão de rascunho só existe com a env ligada. Lido uma vez, fora do
  // render: `import.meta.env` é estático no build do Vite.
  const rascunhoHabilitado = import.meta.env.VITE_CADERNO_DRAFT === "true";
```

- [ ] **Step 2: O handler**

```ts
  const handleDownloadCaderno = async (
    simulado: SimuladoResumo,
    draft = false,
  ) => {
    // ⚠️ Guarda contra clique repetido. O botão já desabilita, mas entre o
    // clique e o re-render cabe um segundo clique — e gerar o caderno é
    // lento o bastante para essa janela ser real.
    if (baixandoCaderno) return;
    setBaixandoCaderno(simulado._id);

    const id = toast.loading(
      draft ? "Gerando rascunho..." : "Gerando caderno...",
    );
    try {
      const { blob, avisos } = await baixarCaderno(
        simulado._id,
        token,
        draft,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `caderno_${simulado.nome}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ⚠️ Aviso é `warning`, não `success`. O download funcionou, mas há algo
      // para conferir antes de imprimir — e este toast é o canal que devolve a
      // responsabilidade a quem cadastrou a questão. Um success verde faz a
      // pessoa fechar sem ler.
      toast.update(id, {
        render:
          avisos > 0
            ? `Caderno gerado com ${avisos} ${
                avisos === 1 ? "observação" : "observações"
              } — confira as questões marcadas`
            : "Caderno baixado com sucesso!",
        type: avisos > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: avisos > 0 ? 8000 : 3000,
        closeOnClick: true,
      });
    } catch (erro) {
      // ⚠️ A mensagem do backend, não uma genérica. É o fim da corrente que o
      // card 05 consertou.
      toast.update(id, {
        render:
          erro instanceof Error ? erro.message : "Erro ao baixar o caderno",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    } finally {
      setBaixandoCaderno(null);
    }
  };
```

⚠️ O `finally` é obrigatório: sem ele, um erro deixa o botão desabilitado para sempre e a única saída
é recarregar a página.

⚠️ `autoClose` maior no aviso — 8s contra 3s. Uma frase que pede ação precisa de mais tempo na tela do
que um "pronto".

- [ ] **Step 3: Os botões**

No import de ícones, acrescente `DocumentArrowDownIcon`:

```ts
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
```

⚠️ **Ícone diferente do cartão, de propósito.** Repetir `ArrowDownTrayIcon` ao lado faz os dois botões
lerem como um duplicado — o usuário clica no errado e recebe o arquivo errado, o que é pior do que
não ter o botão.

Na coluna de ações, **entre** o botão do cartão e o de editar:

```tsx
                      {!simulado.bloqueado && (
                        <button
                          onClick={() => handleDownloadCaderno(simulado)}
                          disabled={baixandoCaderno === simulado._id}
                          title="Baixar caderno de questões (pacote .zip para abrir no Overleaf)"
                          className={
                            baixandoCaderno === simulado._id
                              ? "text-gray-200 cursor-wait"
                              : "text-gray-400 hover:text-blue-600"
                          }
                          aria-label="Baixar caderno de questões"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      )}

                      {simulado.bloqueado && rascunhoHabilitado && (
                        <button
                          onClick={() => handleDownloadCaderno(simulado, true)}
                          disabled={baixandoCaderno === simulado._id}
                          title="Baixar rascunho do caderno (sai com marca d'água e a lista de pendências)"
                          className={
                            baixandoCaderno === simulado._id
                              ? "text-gray-200 cursor-wait"
                              : "text-gray-300 hover:text-blue-500"
                          }
                          aria-label="Baixar rascunho do caderno"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      )}

                      {simulado.bloqueado && !rascunhoHabilitado && (
                        <button
                          disabled
                          title="O simulado precisa estar com todas as questões cadastradas, aprovadas e numeradas"
                          className="text-gray-200 cursor-not-allowed"
                          aria-label="Baixar caderno de questões"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      )}
```

⚠️ **A tabela nunca passa de três ícones.** Os três blocos são mutuamente exclusivos: pronto → caderno;
bloqueado com a env → rascunho; bloqueado sem a env → caderno desabilitado.

⚠️ O tooltip do botão ativo diz **"pacote .zip para abrir no Overleaf"**. Sem isso o coordenador baixa
esperando um PDF e encontra `.tex` dentro.

- [ ] **Step 4: Verificar**

```bash
npx tsc --noEmit
ESLINT_USE_FLAT_CONFIG=false npx eslint src/pages/dashProvas/modals/simuladosView.tsx
npm run build
```

Os três limpos.

⚠️ Se o lint reclamar de complexidade no componente por causa dos três blocos, **reporte** em vez de
extrair às pressas — pode ser sinal de que os botões merecem um componente próprio, e quero decidir
isso sabendo.

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashProvas/modals/simuladosView.tsx
git commit -m "$(cat <<'EOF'
feat(caderno): botao de baixar caderno no SimuladosView

Tres estados mutuamente exclusivos, e a coluna nunca passa de 3 icones:
pronto -> caderno; bloqueado com a env -> rascunho; bloqueado sem a env ->
caderno desabilitado com tooltip.

Rascunho so no estado bloqueado: e pra ele que serve, e dois downloads
ativos lado a lado obrigariam a escolher sem informacao.

Icone DocumentArrowDownIcon, nao o ArrowDownTrayIcon do cartao: dois
iguais lado a lado leem como botao duplicado, e clicar no errado entrega
o arquivo errado.

Loading guarda o _id em voo, nao um booleano: booleano desabilitaria a
tabela inteira. E o `if (baixandoCaderno) return` fecha a janela entre o
clique e o re-render.

Aviso e warning com 8s, nao success com 3s: uma frase que pede acao
precisa de mais tempo na tela.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PrN5kdVC3BqJMYTGnEL9K7
EOF
)"
```

---

### Task 3: Gate manual — **PARA e espera o usuário**

⚠️ **Aqui o gate não é confirmação, é a verificação.** Sem runner de teste no projeto, tudo o que
este card afirma depende dele.

- [ ] **Step 1: Subir a stack**

O `client-vcnafacul` nesta branch (`npm run dev`), apontando com `VITE_BASE_URL` para uma api que
tenha o card 05 mergeado, e essa api apontando com `SIMULADO_URL` para um `ms-simulado` na
`poc/caderno-overleaf`.

⚠️ Se algum dos três não subir, **pare e reporte** com o erro. Não simule o gate.

- [ ] **Step 2: Os oito pontos**

Na tela de simulados do `ShowProva`:

1. Simulado **pronto**: o botão de caderno aparece e baixa `caderno_<nome>.zip`; o zip abre
2. Durante o download o botão desabilita; **clique triplo não dispara três downloads**
3. **Só a linha clicada** desabilita — as outras seguem clicáveis
4. Simulado **bloqueado**, sem a env: botão de caderno desabilitado, com o tooltip do que falta
5. Com `VITE_CADERNO_DRAFT=true`: no bloqueado aparece o de rascunho, e ele **baixa**
6. Um erro do backend vira toast **com a frase do backend** — force um, apontando para um simulado que
   dê 409
7. Simulado com avisos: toast **warning** com a contagem certa
8. O botão do cartão continua funcionando

- [ ] **Step 3: PARE**

Reporte os oito pontos, um a um, com o que aconteceu de fato — não "ok". **Não prossiga sem a
resposta.**

---

### Task 4: Fechar

- [ ] **Step 1: Verificação final**

```bash
npx tsc --noEmit
ESLINT_USE_FLAT_CONFIG=false npx eslint src/services/urls.ts src/services/caderno/baixarCaderno.ts src/pages/dashProvas/modals/simuladosView.tsx
npm run build
```

- [ ] **Step 2: Nada além do escopo**

```bash
git diff poc/caderno-overleaf..HEAD --name-only
```

Esperado: só os quatro arquivos da tabela de estrutura, mais os dois de `docs/`. ⚠️ Em especial,
**nenhuma mudança em `baixarCartao.ts`** nem no botão dele.

- [ ] **Step 3: Abrir o PR contra a POC**

```bash
git push -u origin poc/caderno-overleaf
git push -u origin feature/caderno-06-client-botao
gh pr create --base poc/caderno-overleaf --title "[Caderno · Overleaf] Card 06 — botão Baixar caderno"
```

⚠️ A `poc/caderno-overleaf` é **nova neste repo** e precisa ser empurrada antes, senão o `--base` não
existe no remoto.

O corpo precisa cobrir: os três estados do botão e por que rascunho só no bloqueado; o ícone diferente;
`fetchWrapper` em vez de `fetch` cru; a mensagem do backend chegando ao toast e por que isso importa
depois do card 05; **que o projeto não tem testes** e o que foi verificado no lugar; e o que ficou
registrado e não feito.

## O que este card NÃO faz

**Não migra o `baixarCartao` para `fetchWrapper`** nem mexe no botão dele. Mesmo argumento do card 05:
caminho de download em produção, sem o card pedir.

**Não introduz runner de teste.** Decisão de projeto — dependência nova, config, CI — e um card de POC
que acrescenta um botão não é o lugar de tomá-la.

**Não esconde o botão em prova ENEM oficial.** Depende de uma decisão de direito autoral que ainda não
foi tomada (pergunta 3 do README da POC). Se for "só categorias custom", a checagem entra no
`ms-simulado`, junto do gate, para não duplicar regra.
