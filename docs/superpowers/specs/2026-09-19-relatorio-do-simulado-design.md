# O relatório do simulado, em rota própria

> Card de origem: `vcnafacul-3/docs/cards/relatorio-simulado-cursinho/06-FRONT-relatorio-geral-na-listagem-de-provas.md`
> Repo: `client-vcnafacul` · Branch: `feature/06-relatorio-do-simulado`
> Consome: api **#551** (mergeado) e api **#552** (`04b`, aberto) + ms **#195**

---

## O que este card entrega

A tela que a série inteira existe para produzir: o coordenador de cursinho abre **um simulado** e vê,
linha a linha, como cada estudante foi — incluindo quem não enviou cartão e quem enviou e a leitura
falhou, com o motivo.

E entrega o **componente compartilhado**: o card `05` não reescreve nada, só acrescenta a entrada pela
tela de turma.

## A rota

`/dashboard/relatorio-simulado/:simuladoId`, com `?turma=<id>` opcional.

⚠️ **Não aninhada em `cursinho-provas`.** O card `05` vai linkar para cá a partir da tela de turma, e
um caminho com `cursinho-provas` no meio mentiria sobre a origem.

⚠️ **O `?turma=` entra agora, neste card.** O componente precisa ser parametrizado de qualquer jeito
(é a exigência central do `06`), a rota da api já existe, e o custo marginal é ler um search param e
escolher qual das duas funções de serviço chamar. É isto que permite ao `05` ser só a aba.

Protegida por `ProtectedRoutePermission` com `gerenciarEstudantes` — a mesma que a api exige.

⚠️ **Limitação conhecida, registrada e não consertada aqui:** `ProtectedRoutePermission` é
`<Navigate to={DASH} replace />`. Link mandado a quem não tem a permissão cai no dashboard **sem
explicação**. Isso enfraquece a razão "link" que justificou a rota, e é o card `10`.

## O que a URL não é

⚠️ **A URL não é autoridade sobre o recorte.** O `cursinhoId` vem do **JWT**, sempre; trocar o
`:simuladoId` ou o `?turma=` na barra de endereços não amplia o que a pessoa vê — o `04` devolve 403
para turma de outro cursinho. O gate de rota existe para a experiência ser honesta, **não** para conter
vazamento.

---

## A ação que leva até lá

No `dashProvas/modals/simuladosView.tsx`, mais um `AcaoIcone` por simulado.

⚠️ **O `simuladosView` é compartilhado** — `partnerPrepProvas/index.tsx:26` importa o `ShowProva` do
`dashProvas`, e `showProva.tsx` renderiza o `SimuladosView`. **Uma ação acrescentada ali aparece nas
duas telas por padrão.**

Então ela é **ligada por prop explícita vinda da página**, atravessando `ShowProva` → `SimuladosView`,
e **só a `PartnerPrepProvas` a liga**.

⚠️ **A permissão não pode ser o interruptor.** `gerenciarEstudantes` pode existir para um admin de
plataforma, e aí a ação voltaria a aparecer na `dashprovas`, onde o `04` lhe daria 403 —
`resolveCursinhoIdByUserId` lança `ForbiddenException` sem colaborador ativo com `partnerPrepCourse`.
O interruptor é **a tela**. A permissão é outra checagem, mais abaixo, para desabilitar a ação de quem
tem `visualizarProvasCursinho` mas não `gerenciarEstudantes`.

### Desabilitada com motivo, como as vizinhas

Simulado sem nenhum cartão não tem relatório: a ação fica desabilitada e o tooltip diz isso, em vez de
abrir uma tela vazia.

O dado vem do card `04b` — `GET /mssimulado/relatorio/simulado/simulados`, que devolve os simulados do
cursinho **que têm cartão**, com as contagens. Uma chamada quando o modal abre, um `Map` por
`simuladoId`, e cada ação consulta.

⚠️ **Não chamar o `04b` quando a ação não está ligada.** Na `dashprovas` o usuário pode não ter
cursinho, e a chamada devolveria 403 no console sem nenhum propósito.

⚠️ O `AcaoIcone` usa `aria-disabled`, nunca `disabled` nativo — de propósito, porque `disabled` bloqueia
foco e hover e o tooltip que explica o motivo nunca abriria. Seguir o padrão; não criar outro botão.

---

## A tela

### Duas visões, uma rota

Abas **Estudantes** e **Questões**.

⚠️ **A de questões busca na primeira abertura, não junto.** São duas chamadas independentes na api
(`/:simuladoId` e `/:simuladoId/questoes`) e a maioria das visitas só quer as linhas. Buscar as duas
sempre dobra o tempo até a primeira coisa útil aparecer.

### A tabela é o `DashTable`, sem contexto

⚠️ **Não o `DashListTemplate`.** Ele chama `useDashCardContext()` internamente e exigiria um
`DashCardContext.Provider` sintético: `cardTransformation` devolvendo um `CardDash` de mentira — que
obriga um `status` de enum sem significado nenhum para "estudante teve cartão lido" —, mais
`onClickCard`, `getMoreCards` e `limitCards`, todos obrigatórios e todos sem sentido aqui.

O `DashTable` **não usa o contexto**, e o barril (`components/dashV2/index.ts`) exporta junto tudo o
que falta: `sortRows` (que já resolve `localeCompare` pt-BR — importa, é lista de nomes próprios),
`StatusBadge`, `DashTableVazio`, `DashTableErro`, `LinhasSkeleton` e os tokens de cor.

⚠️ **Ordenar é do consumidor.** O `DashTable` só chama `onSortChange`; quem ordena é quem o monta, com
`sortRows`. **Importar, não reimplementar** — ele já trata datas ISO, ordenação estável e nulos no fim
nas duas direções.

### As colunas

Estudante (nome + matrícula), turma, status, aproveitamento, questões respondidas, e — quando
`failed` — o motivo.

⚠️ **`StatusBadge` exige rótulo; não existe modo só-ícone.** A exceção (`SimuladoStatusIcon`) mora
local ao `dashProvas` de propósito, para não virar padrão por importação, e o custo dela está medido:
tooltip do Radix não abre no toque. Aqui há largura de tela inteira — usar o `StatusBadge`.

### O status

Uma função pura `statusDaLinha(linha) → { tone, label }`, no molde do `statusVisual` que já vive em
`dashProvas/modals/simuladoStatus.ts`: testável sem montar componente nenhum.

⚠️ **`awaiting_omr` não existe no client.** O `HistoricoStatus` de `historicoDTO.ts` é
`'pending' | 'processing' | 'completed' | 'failed'` — está desatualizado e é consumido por outra tela.
**União nova, própria do relatório**, em vez de remendar aquela e arriscar a tela do estudante.

Quem não enviou cartão (`enviouCartao: false`) é uma linha como as outras, com o seu próprio rótulo.
⚠️ **Ler `enviouCartao`, não inferir da ausência de `historicoId`** — a api devolve o campo explícito
exatamente para que ninguém infira.

### ⚠️ A nota não aparece quando o status não é `completed`

O `marcarFalha` do ms **não limpa** `aproveitamento`. Um cartão que leu bem, foi refotografado e
falhou continua carregando a nota antiga, e a api **repassa como veio** — de propósito: a api não
reescreve o que o ms disse, e foi essa a decisão do card `04`.

**Então quem decide não renderizar é esta tela.** Célula vazia, não zero: zero é uma nota, ausência de
leitura não é.

⚠️ É o mesmo defeito que a revisão do `04` pegou no cálculo da média, reaparecendo na célula. Lá foi
fechado gateando por `status === 'completed'`; aqui é o mesmo gate, no render. Um teste precisa fixar
isso com uma linha `failed` que traz nota.

### O resumo

As duas contagens sempre — `totalNoRecorte` e `comLeituraConcluida` — mais a média.

⚠️ **As duas, nunca uma.** Sem as duas ninguém entende a diferença entre "30 alunos" e "27 no cálculo",
e a média parece errada.

`aproveitamentoGeral` é `null` quando ninguém teve leitura: mostrar "—", não "0%".

⚠️ **`linhasSemEstudanteAtivo` vira nota de rodapé quando `> 0`, e nunca lista nomes.** É quem saiu do
cursinho depois de enviar o cartão. Sem a nota, os totais não batem e a leitura natural é *"o sistema
perdeu cartão"* — que é o chamado que o card `08` quis evitar. O nome de quem saiu não é informação
que este relatório deva expor.

⚠️ **Escrito na tela que o recorte é só cartão-resposta.** Um relatório que silenciosamente ignora quem
respondeu online gera a pergunta "cadê o fulano?" na primeira semana.

### Estados

Carregando, vazio e erro com tratamento explícito, reusando `LinhasSkeleton` / `DashTableVazio` /
`DashTableErro`. **Não** o padrão da aba de alunos da tela de turma, cujo único retorno é o toast.

---

## O "voltar"

Este é o preço de ter escolhido rota em vez de modal, e o card o elevou a critério de aceite.

**Saindo:** `navigate(rota, { state: { de: { filtros, provaId, pagina } } })`.

**Voltando:** a `PartnerPrepProvas` lê `location.state` no mount, re-semeia os cinco filtros
(`nameFilter`, `edicaoFilter`, `aplicacaoFilter`, `anoFilter`, `gabaritoOnly`), reabre o `ShowProva` da
prova certa, e passa `paginaInicial` ao `DashListTemplate`.

### ⚠️ Três armadilhas medidas

**1. Reabrir o modal tem que esperar a lista chegar.** `onClickCard` faz
`provas.find((p) => p._id === id)` (`partnerPrepProvas/index.tsx:154-157`). Restaurar no mount, com
`provas` ainda vazio, acha `undefined` e o `provaSelected!` do `ModalShowProva` estoura. A restauração
do modal roda **depois** do fetch, não no mount.

**2. O `location.state` tem que ser consumido uma vez só.** Sem limpar, um `navigate` posterior para a
mesma rota ressuscita filtros velhos. Limpar com `navigate(pathname, { replace: true, state: null })`
depois de aplicar, ou guardar num `ref` — e há teste para isso.

**3. A página não é da página: é do `DashListTemplate`.** `useState(1)`, linha 226. O template serve
`dashProvas` **e** `partnerPrepProvas`, então mexer nele é mudança de duas telas.

**Duas props aditivas**, `paginaInicial` e `onPaginaChange`, com `useState(paginaInicial ?? 1)`. Sem
inversão de controle; o default fica idêntico ao de hoje.

⚠️ **Isso sozinho não funciona.** A linha 265 — `if (pagina > paginas) setPagina(paginas)` — roda
**durante o render**, e `totalDePaginas(0, n)` devolve **1** (`paginacao.ts` garante "nunca zero").
Enquanto a lista carrega, `entities` está vazio, `paginas` é 1, e a página restaurada é **zerada antes
das linhas chegarem**. O clamp precisa ser ignorado enquanto `state === "loading"`.

Medido: a `partnerPrepProvas` **já passa** `state={carregando ? "loading" : "idle"}` (linha 458), então
o guard funciona lá. A `dashProvas` **não passa `state`** — e não precisa: sem `paginaInicial` o
comportamento é o de hoje.

⚠️ O reset de página por mudança de `activeFilterCount` (linha 253) **não** atrapalha: os filtros
voltam no primeiro render, então a contagem não muda depois.

⚠️ **Isto não é o card de paginação server-side** que o README do dashV2 lista como pendência. Aquele é
outro problema — filtro e ordenação no backend. Este é estado de navegação, em memória.

---

## Impressão

`print:hidden` — variante nativa do Tailwind — no `Header` (`components/organisms/header`) e no
`SidebarDash`, e o offset de 76px zerado na impressão.

⚠️ **Não existe `@media print` nenhum no repo**, nem `window.print`, nem folha de impressão. É a
primeira.

⚠️ O 76px está repetido em três arquivos (`baseTemplate`, `dashTemplate`, `DashListTemplate`) sem
constante compartilhada. **Não unificar agora** — é refactor de outro assunto, e mexer nos três dentro
deste PR esconde a mudança na revisão.

---

## Riscos

⚠️ **O `04b` ainda não está mergeado** (ms #195, api #552). Sem ele a ação não tem como saber quais
simulados têm cartão. Se a ordem de merge inverter, a ação fica sempre habilitada e abre relatório
vazio — o que o card quis evitar.

⚠️ **`DashToolbar.test.tsx` leva ~51s para 22 testes**, por sobrecarga entre testes cuja causa não foi
encontrada. Testes que montam Popover/Tooltip do Radix são caros e vazam entre si. **Poucos testes
abrindo tooltip, cada um verificando tudo de uma abertura só** — e `statusDaLinha` testado como função
pura, sem render.

⚠️ **`npm run lint` está quebrado no repo** (ESLint 9 procurando `eslint.config.js` com `.eslintrc.cjs`
legado). Para verificar: `ESLINT_USE_FLAT_CONFIG=false npx eslint <caminhos>`.

## Fora de escopo

- A entrada pela tela de turma — card `05`, que só acrescenta a aba.
- O detalhe do estudante — card `07`.
- A página de acesso negado — card `10`.
- Reprocessar cartão — card `09`.
- Unificar o 76px num token.

## Critérios de aceite

- [ ] A ação aparece por simulado em `cursinho-provas`, no padrão das vizinhas
- [ ] A ação **NÃO** aparece em `dashprovas` — teste provando, porque o `simuladosView` é compartilhado
      e o default é aparecer nas duas
- [ ] Simulado sem cartão: ação desabilitada com motivo no tooltip, com dado do `04b`
- [ ] Quem tem `visualizarProvasCursinho` mas não `gerenciarEstudantes`: ação desabilitada com motivo
- [ ] A rota é protegida por `gerenciarEstudantes`
- [ ] `?turma=` restringe o relatório, e sem ele é o cursinho inteiro
- [ ] Estudante sem cartão aparece, lido de `enviouCartao` e não inferido
- [ ] **Linha com status diferente de `completed` não mostra nota** — teste com uma linha `failed` que
      traz `aproveitamentoGeral`
- [ ] Linha `failed` mostra a descrição amigável do card `01`
- [ ] As duas contagens aparecem; média `null` vira "—", não "0%"
- [ ] `linhasSemEstudanteAtivo` aparece como nota quando `> 0`, **sem nomes**
- [ ] A tela diz que o recorte é só cartão-resposta
- [ ] Aba de questões busca só na primeira abertura
- [ ] Carregando, vazio e erro têm tratamento explícito
- [ ] **Voltar** restaura os cinco filtros, a página, e reabre o modal da prova
- [ ] O `location.state` é consumido uma vez só — teste
- [ ] `paginaInicial` sem `state="loading"` não regride a `dashprovas` — teste
- [ ] Impressão esconde header e sidebar
