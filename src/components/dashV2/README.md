# Dash V2 — listagens administrativas

Uma segunda dash, **concorrente** da `templates/dashCardTemplate`, para as telas em que o
administrador precisa **comparar, ordenar e varrer** registros. A `dashProvas` é a tela piloto.

> ⚠️ **Este documento não descreve a API.** Os tipos e os JSDoc de cada arquivo fazem isso, e duplicar
> aqui garante divergência. O que está escrito abaixo é o que o código **não consegue dizer**: os
> porquês, as medições, e o que é proibido tocar.

---

## Por que existe

O `DashCardTemplate` resolveu um problema real — cada tela administrativa nova exigia refazer header,
filtro, grid e paginação na mão — e nove telas vivem nele. **Isso não está em discussão.**

O que o V2 ataca é outra coisa: o template só sabe desenhar **um** layout, grid de cards de 288px. No
banco de provas, cada card empilha quatro números como `campo: valor` e cabem quatro por linha. Para
achar *"a reaplicação de 2019 que ainda tem questão faltando"*, o usuário rola a página lendo card a
card.

⚠️ **Levantamento das nove telas:** nenhuma preenche `card.logo` (o campo existe no `CardDash` e não é
usado em lugar nenhum), e todas montam de três a cinco pares `campo: valor`. O grid de card não está
sendo usado pelo que card faz bem — está sendo usado como tabela desalinhada.

Isso **não** torna o V1 dispensável. Ele é a resposta certa para a tela que ainda não existe: galeria
de cursinhos com foto, banco de imagens, vitrine de conteúdo.

---

## A regra inegociável

> **Nada do V1 muda.** `templates/dashCardTemplate`, `molecules/cardDash`, `context/dashCardContext`,
> `atoms/filter`, `atoms/select` e `components/ui/*` não são editados por trabalho do V2.

Uma tela migrada volta ao V1 trocando uma linha de import. É isso que torna a POC segura, e é a razão
de várias decisões abaixo parecerem tortas fora de contexto.

Se um trabalho parecer exigir mexer em arquivo do V1, **ele para e vira discussão** — não é feito de
passagem.

---

## Como migrar uma tela

São três níveis. O primeiro leva minutos; o terceiro é onde está o trabalho.

### Nível 1 — trocar o import

```tsx
- <DashCardTemplate />
+ <DashListTemplate />
```

**Todas as props são opcionais.** Sem `columns`, o template deriva do `cardTransformation` que a tela
já fornece (`deriveColumns.tsx`): coluna 1 = `title`, uma por `infos[i].field`, última = `StatusBadge`.
Sem `actions`, deriva dos `buttons` (`deriveActions.ts`).

Rode assim **primeiro**. Isso já diz se a tela faz sentido como tabela, antes de escrever qualquer
coluna.

⚠️ A saída é degradada de propósito: tudo à esquerda, ordenação numérica só quando **todos** os valores
da amostra são numéricos.

### Nível 2 — colunas explícitas

`columns.tsx` ao lado do `index.tsx`, como na `dashProvas`. É o que dá alinhamento, largura,
formatação, `hideBelow` e ordenação correta.

⚠️ **`actions` é tudo ou nada.** Passar `actions` desliga o fallback inteiro — não dá para declarar só
a primária e deixar o resto derivar.

### Nível 3 — o que a tela precisa mudar nela mesma

- **Remover `key={resetKey}`** e passar `onClearFilters` + `activeFilterCount`. Os selects da tela
  precisam virar controlados. Remontar descarta ordenação, página e posição de rolagem.
- **Conferir o par `entities` / `setEntities`** — ver a seção seguinte.
- **Passar `state="loading"`** no primeiro carregamento, senão o skeleton nunca aparece.
- **Tirar "Limpar filtros" da lista de botões.** Ele não é ação de registro; mora na barra de filtros.

### Classificação das oito telas restantes

| Tela | Nível esperado | Por quê |
|---|---|---|
| `dashContent`, `dashGeo`, `dashNews`, `partnerPrepManager` | 1 → 2 | passam lista bruta + setter da mesma; sem `resetKey` |
| ~~`dashRoles`~~ | ✅ migrada | nível 2 — busca **sob demanda** no servidor: usa `textoVazio` (não carrega nada de início) e `onSearchSubmit` (Enter), as duas props que entraram por ela |
| ~~`partnerPrepProvas`~~ | ✅ migrada | nível 3, feita — reusa `dashProvas/columns` inteiro |
| ~~`partnerPrepInscriptionManager`~~ | ✅ migrada | nível 3 — o setter que mesclava por id era contorno do scroll do V1 e saiu; lista inteira carregada página a página (`getTodasAsInscricoes`); primeira tela com `DashDateRangeFilter` e `totalSemFiltro` — tickets/021 |

### Duas telas sobre a mesma tabela: o caso `dashProvas` × `partnerPrepProvas`

A tela do cursinho **importa `colunasDeProva` da `dashProvas`**, não uma cópia. Uma cópia divergiria na
primeira correção feita só de um lado — e a coluna Categoria já mostrou como esse defeito passa
despercebido por meses.

O que difere entre as duas é só: o serviço da listagem, a permissão da ação primária, e quais ações
existem. Nada disso justifica um segundo `columns.tsx`.

⚠️ **Testar "esta ação não existe" com `querySelector('[data-action-id=...]')` NÃO funciona para ações
de overflow.** Elas moram dentro do Popover do `⋯`, que só renderiza aberto — então a consulta devolve
`null` tanto quando a ação não existe quanto quando ela está escondida ali. Provado por mutação: pôr
"Sincronizar" no `overflow` deixava o teste verde.

O que funciona, e é barato: **assertar que o botão `⋯` não existe**. O `DashToolbar` só o desenha
quando há o que colapsar. Sem abrir Popover nenhum, e sem os segundos de jsdom que isso custaria.

### Checklist por tela migrada

- [ ] Todas as ações que existiam continuam acessíveis, **inclusive as que foram para o `⋯`**
- [ ] As permissões (`Roles.*`) de cada ação são **idênticas** — comparar item a item
- [ ] Clicar no registro abre o mesmo destino
- [ ] Os filtros filtram o mesmo conjunto de campos
- [ ] A contagem de registros confere com a de antes
- [ ] Carregando, vazio e erro aparecem
- [ ] `yarn test` e `yarn build` limpos

---

### "3 de 12 registros": `totalSemFiltro`

Como `entities` chega já filtrada pela tela, o template não sabe o total. Com `totalSemFiltro` e filtro
ativo, o subtítulo vira "3 de 12 registros" — sem ele, "3 registros" com filtro ligado parece que só
existem três. Sem filtro ativo, o total não aparece mesmo se passado.

### Filtro de intervalo de datas: `DashDateRangeFilter`

Para o `filters` do template. Controlado (`value` / `onChange`, em `yyyy-mm-dd`); a regra de
comparação é `dentroDoIntervalo(data, intervalo)`, que a tela aplica na sua lista.

- **`<input type="date">` nativo**, e não calendário do Radix: teclado e leitor de tela de graça, e
  nenhum Popover no jsdom.
- ⚠️ **Dia do calendário local**: `de` às 00:00, `até` às 23:59:59.999. **Nunca** `new Date("2026-03-10")`
  — sem hora, a spec lê como UTC, e no Brasil isso é 21h do dia anterior.
- Intervalo invertido: o componente avisa, e `dentroDoIntervalo` **não filtra** (esconder a lista inteira
  por um erro de digitação seria pior).
- `intervaloAtivo` é o que conta no `activeFilterCount`.
- ⚠️ O teste fixa `TZ=America/Sao_Paulo` no próprio arquivo: os defeitos de fuso só aparecem num fuso
  negativo, e em UTC (o CI) passariam calados.

---

## `entities` é leitura

> **O template nunca chama `setEntities`.** É a diferença de contrato mais importante entre V1 e V2.

No V1, o scroll infinito faz `setEntities([...entities, ...newItems])`. Telas que passam
`entities: <lista filtrada>` + `setEntities: <setter da lista bruta>` têm os registros escondidos pelo
filtro **apagados do estado** — não escondidos, apagados; só um F5 traz de volta.

Há teste com spy provando que o V2 não reintroduz isso.

⚠️ O Provider continua **exigindo** `setEntities`. Passe o setter real, **não uma função vazia** — a
função vazia mascararia o bug caso a tela volte ao V1.

⚠️ `cardTransformation` também continua obrigatório, mesmo com colunas explícitas: o template o usa
para extrair o `id` do clique. Remover quebra a tipagem.

---

## Decisões que não devem ser reabertas

Cada uma tem medição. Se alguém "consertar" uma delas, quebra algo que foi medido.

### O botão principal tem texto `marine`, não branco

Branco sobre `#FF7600` dá **2.68:1** — reprova até no limite de 3:1 de componente gráfico. `marine`
sobre o mesmo laranja dá **5.62:1** e mantém o laranja exato da marca.

O `typeStyle="primary"` do V1 continua com texto branco e **não é tocado**.

### O ponto de status "em andamento" fica em 2.21:1, de propósito

Contraste do ponto contra o próprio chip: `done` 3.36:1, `missing` 3.38:1, `neutral` 4.46:1, e
**`running` 2.21:1**.

Nenhum laranja da paleta alcança 3:1 sobre fundo alaranjado claro — testados `orange` (2.42) e clarear
o chip para `/5` (2.54). Fica assim porque **o texto carrega o significado** (13:1+ em `marine`) e o
ponto é pista rápida. A alternativa seria um segundo laranja no produto, que é a deriva que este
trabalho existe para corrigir.

⚠️ O `neutral` usa `grey` e não `gray2`: `gray2` dava 2.19:1 e tinha conserto de graça.

⚠️ `yellow` saiu de status — 1.27:1 sobre branco, invisível até como marcador.

### Cinco tons de status, e o quinto (`info`) existe por um motivo concreto

`done` · `running` · `info` · `missing` · `neutral`.

O `info` (`blueGeo`) entrou porque **"Em cadastro" e "Em validação" saíam os dois em `running`** no
banco de provas: mesmo chip laranja, distinguíveis só pelo rótulo. A progressão agora lê como
progressão — cinza (sem questões) → laranja (em cadastro) → azul (em validação) → verde (completa).

Medido: `blueGeo` 3.54:1 sobre branco, ponto contra o próprio chip **3.18:1** (o melhor de todos os
tons) e `marine` sobre o chip 13.52:1.

⚠️ `blueGeo` é cor **da paleta da marca**, não o `blue-500` do Tailwind que vazou para o `Select` do
V1 — a catraca continua barrando aquele.

⚠️ Há teste garantindo que **nenhum tom repete o chip de outro**. Dois tons com o mesmo chip são, na
prática, um tom só.

### O ícone de status tem cor própria (`status[tone].icon`), e ela não segue o ponto

O `dot` vive sobre o chip (`bg-` da cor a 10%); o **ícone** vive sobre a superfície branca. Fundos
diferentes, medições diferentes — então são dois tokens, não um com dois prefixos.

Sobre branco: `green3` 3.77:1, `red` 3.88:1, `grey` 4.95:1, `darkGrey` 7.57:1. Todos passam no limite
de 3:1 de componente gráfico.

⚠️ **`running` sai em `darkGrey`, não em laranja.** Nenhum laranja da paleta alcança 3:1 sobre branco
(`darkOrange` 2.45:1, `orange` 2.68:1) — um ícone laranja seria um status que parte das pessoas não
enxerga. Como no ponto, a saída não é inventar um laranja escuro: aqui **quem distingue o estado é a
forma do ícone** (relógio × cadeado × check), e a cor é reforço.

### Status só-ícone: existe uma exceção, e ela mora fora do dashV2

O `StatusBadge` **continua proibindo modo só-ícone** — é o padrão das listagens e não mudou.

O modal de simulados do `dashProvas` faz diferente: 672px de largura, sete colunas que só cabiam com
rolagem horizontal, e o status virou ícone com tooltip (`pages/dashProvas/modals/SimuladoStatusIcon`).
O componente é **local à tela de propósito**, para a exceção não virar padrão por importação.

⚠️ O que se perde: **tooltip do Radix não abre no toque**. Em tablet o ícone fica mudo para quem
enxerga. Leitor de tela fica coberto pelo `aria-label`, que não depende de abrir nada. Se a próxima
tela for de estudante e não de administração, esse custo provavelmente não vale.

### Não use o `<Table>` do shadcn — use `<table>`

O wrapper `<Table>` envolve tudo num `div.relative.w-full.overflow-auto`. **Um ancestral com `overflow`
vira o scrollport do `position: sticky`**, e como esse div não tem altura ele nunca rola: o cabeçalho
grudaria nele e sumiria junto com a página.

O critério "cabeçalho permanece visível ao rolar" falharia **sem nada acusar**. O resto do shadcn
(`TableBody`, `TableCell`, `TableHeader`, `TableRow`) é usado normalmente.

⚠️ Pelo mesmo motivo o bloco branco da tabela **não** leva `overflow-hidden`.

### Colapso responsivo em JS, não em CSS

A toolbar abaixo de 768px e a lista empilhada usam o hook `useAcimaDeSm`, não `hidden sm:flex`.

Com CSS, a mesma ação existiria **duas vezes no DOM** e o leitor de tela leria as duas. `window.matchMedia`
não existe no jsdom — o hook cai em "desktop" quando ele falta, e o teste injeta o mock.

⚠️ Esconder **coluna** por CSS (`hideBelow`) é diferente e está OK: não duplica nada.

### Não existe `mode="server"`

A paginação server-side depende de filtro e ordenação no backend, que não foram feitos. Uma prop que
meio-funciona é pior que uma prop ausente, porque parece feature pronta. Acrescentar depois é aditivo.

### A tabela não ordena sozinha

`DashTable` só chama `onSortChange`; quem ordena é o template, com `sortRows.ts`. É isso que permite
trocar para ordenação no servidor sem tocar no componente.

⚠️ `sortRows.ts` já resolve `localeCompare` pt-BR (sem ele, "Ática" cai depois de "Zebra"), datas
normalizadas (`createdAt` é tipado como `DateTime` do luxon mas **chega como string ISO** — comparar
cru vira ordem alfabética), ordenação estável e nulos no fim nas duas direções. **Importe; não
reimplemente.**

### Cor sempre pelos tokens

⚠️ A catraca de paleta (`tokens.test.ts`) lê o `tailwind.config.js` de verdade e derruba cor de fora
da paleta — **mas ela guarda só o `tokens.ts`**. Se um `.tsx` escrever `text-slate-700`, nada acusa.

Faltando um papel, **acrescente ao `tokens.ts`** em vez de contornar. Foi o que os componentes fizeram
com `menuItem`, `destructiveGhost`, `row.hover` e `progress`.

---

## Custo de teste: este diretório é lento, e a causa é desconhecida

`DashToolbar.test.tsx` leva **~51 s** para 22 testes, e o custo está espalhado por todos eles —
inclusive por um que só compara um número e leva 1,6 s. É overhead **entre** testes: algo montado
antes segue rodando e o tempo é cobrado do seguinte.

⚠️ **O sintoma é traiçoeiro:** o worker fica bloqueado, o RPC do vitest estoura, e a pipeline falha
com `Timeout calling "onTaskUpdate"` **e todos os testes verdes** — o log mostra `Tests 307 passed`
seguido de `Errors 1 error`. Quem olhar a lista de testes não vê nada errado.

**Contornado** no `vite.config.ts` com `pool: "forks"` e `teardownTimeout: 30000`. **É contorno, não
conserto.**

**Hipóteses já descartadas por medição — não as repita:**

| hipótese | medição |
|---|---|
| `@floating-ui/react-dom` do Radix Popper | stub via `vi.mock` hoisted: **51 s, sem diferença** |
| `TooltipProvider` | 1 ms num probe isolado |
| render do `DashToolbar` | 1 a 16 ms |
| `vi.useFakeTimers()` | contribui ~14 s dos 51; não explica o resto |

⚠️ `test.alias` **não** funciona para pacotes em `node_modules` — o vitest os resolve externamente. Se
for tentar stub de dependência, use `vi.mock` no topo do arquivo de teste.

**Regra prática enquanto isso não for resolvido:** poucos testes abrindo o `⋯`, cada um verificando
tudo de uma abertura só.

## O que está pendente

**Não consertar por conta própria** — cada um tem motivo para estar aqui.

| Pendência | Por que não foi feito |
|---|---|
| **`components/ui/pagination` não é acessível por teclado** — renderiza `<a>` **sem `href`**, que pela spec não é link: sem foco, sem Enter. Rótulos em inglês. | Arquivo compartilhado do V1, usado por `simulationHistories`, `partnerClass` e `dashQuestionNew`. Card próprio. |
| **"Gerenciar Categorias" está atrás de `Roles.alterarPermissao`** — administração de papéis, sem relação com categoria de prova. Parece copiar-e-colar. | Mudar permissão junto com redesenho esconde a mudança na revisão. Card próprio. |
| **Acessibilidade e teclado** na tabela | Card próprio, ainda não feito. |
| **Filtro e ordenação server-side** | Card próprio. É o que destrava o `mode="server"`. |
| **`npm run lint` está quebrado no repo** — ESLint 9 procurando `eslint.config.js` com `.eslintrc.cjs` legado. Não lint-a nada, e o CI não o roda. | Migrar mexe no status de lint de todo arquivo. Card próprio. Para verificar seus arquivos: `ESLINT_USE_FLAT_CONFIG=false npx eslint <caminhos>`. |

### Gate visual nunca executado

Cinco coisas que jsdom não alcança e que **ninguém verificou no navegador**:

1. Densidade em 1440px — o alvo é ao menos 18 provas sem rolar
2. Lista empilhada em 768px
3. O cabeçalho sticky com o header de 76px do site por cima
4. Truncamento de nome longo de prova do ENEM
5. Paginação com mais de 25 registros — hoje só chegam 40 do gateway, e havia PR aberto consertando
