# A entrada pela turma

> Card de origem: `vcnafacul-3/docs/cards/relatorio-simulado-cursinho/05-FRONT-relatorio-por-turma.md`
> Repo: `client-vcnafacul` · Branch: `feature/05-entrada-pela-turma`
> **Sai de `feature/06-relatorio-do-simulado`** (PR #689, aberto) — a rota, os serviços e os DTOs
> vivem lá, e nada foi mergeado ainda. Consome também ms **#195** + api **#552** (card `04b`).

---

## O que sobrou para este card

O `05` original descrevia a tela inteira. **Isso mudou de dono:** como o `06` exige que o componente
de relatório seja **um só**, e a decisão foi que ele mora numa rota própria, o `06` construiu tudo —
linhas, resumo, aba por questão, impressão, "voltar" — **já parametrizado por `?turma=`**.

Sobrou o que é genuinamente deste card: **a entrada pela tela de turma.**

⚠️ **Se aparecer aqui qualquer coluna, estado ou cálculo do relatório, o card está errado.** Duas
cópias divergem na primeira correção feita de um lado só.

## Onde entra

`src/pages/partnerClassWithStudents/index.tsx`, rota `turmas/:hashClassId`.

⚠️ **A tela já tem abas** — `alunos` e `desempenho`, com `Tabs` do shadcn e `activeTab` local, e o
padrão de renderizar controle próprio ao lado do `TabsList` quando aquela aba está ativa. Uma terceira
entra nesse padrão. **Não inventar mecanismo novo.**

⚠️ **`hashClassId` é o id cru da turma, não um hash.** O nome mente: a listagem navega com
`classItem.id` (`partnerClass/components/renderClassesTable.tsx:42`), e `getClassById(token,
hashClassId)` bate em `GET /class/:id`. Serve direto no `?turma=` e na chamada do `04b`, sem esperar o
fetch da turma.

## A permissão mora na tela, porque a rota não a tem

⚠️ **A rota da turma não tem `ProtectedRoutePermission`** — é um `<Route>` pelado
(`PlatformRoutes.tsx:238-240`). Quem tem `visualizarTurmas` entra.

Mas o relatório exige `gerenciarEstudantes`, e a rota do `04b` devolve **403** sem ela.

**Decisão: a aba não aparece para quem não tem `gerenciarEstudantes`**, e a chamada do `04b` não
acontece.

⚠️ **Diferente do card `06`, que desabilita a ação com motivo em vez de escondê-la.** A diferença é o
que a coisa é: um ícone numa linha, desabilitado com tooltip, é informação no lugar onde a pessoa já
está olhando. Uma aba é **navegação**, fica no topo da tela o tempo todo, e o `TabsTrigger`
desabilitado do shadcn não recebe foco nem hover — o mesmo defeito que fez o `AcaoIcone` usar
`aria-disabled` em vez de `disabled`. Uma aba morta seria ruído permanente sem conseguir dizer por quê.

⚠️ **O custo, registrado:** quem não tem a permissão não descobre que o relatório existe. Aceito — é
a mesma troca que a plataforma já faz com os itens de menu.

## O que a aba mostra

**Os simulados que aquela turma respondeu por cartão** — do card `04b`.

⚠️ **O serviço do client precisa crescer.** `buscarSimuladosComCartao(token)` só bate em
`/mssimulado/relatorio/simulado/simulados`; a api já expõe `/simulados/turma/:turmaId` (construída no
`04b`) e ninguém a consome ainda. Ganha um `turmaId` opcional, no mesmo desenho do
`caminhoDoRelatorio`: segmento de caminho, nunca query, e o `cursinhoId` continua saindo do JWT.

Por simulado: **nome**, **cartões**, **no cálculo da média**, **último envio**. Ordenado por recência.

⚠️ **Não é um seletor de todos os simulados.** Mostra só o que tem dado, então ninguém abre relatório
vazio por engano — e a lista já é a resposta para *"quais simulados essa turma respondeu?"*, que é uma
pergunta que o coordenador tem de qualquer jeito.

⚠️ **`ultimoEnvio` não é "última atividade".** É quando o estudante mais recente entrou no recorte: o
`registrar` do ms é upsert, então um reenvio do mesmo estudante não move a data. Rotular como
atividade seria afirmar o que o número não diz.

⚠️ **`cartoes` conta PESSOAS, não fotos** — a unicidade da junção é `{simulado, cursinhoId, usuario}`.

⚠️ **`nome` pode vir `null`**, e a linha **não some por isso.** O `04b` devolve nulo quando o documento
do `Simulado` sumiu da coleção — os cartões continuam existindo, e escondê-los seria o oposto do que
este relatório serve para fazer. A linha mostra um rótulo honesto ("simulado removido") e continua
clicável: o relatório dele ainda abre, porque as respostas estão no histórico, não no simulado.

⚠️ **"No cálculo da média", não "com leitura concluída"** — mesmo rótulo que o `06` adotou, e pelo
mesmo motivo: a api conta com `status === 'completed'` **e** nota numérica.

## A tabela

`DashTable` com `onRowClick`, reusando o que o `06` trouxe: `sortRows` (que já resolve `localeCompare`
pt-BR), `LinhasSkeleton`, `DashTableVazio`, `DashTableErro` e os tokens.

⚠️ **`DashTable`, não `DashListTemplate`** — só o segundo usa o `DashCardContext`, que exigiria um
`cardTransformation` de mentira. Mesma decisão do `06`.

⚠️ **A lista é pequena (dezenas) e o Dash V2 pagina só no cliente** — `mode="server"` não existe de
propósito. Aqui não é problema; fica registrado para ninguém procurar a prop.

Cada linha navega para `/dashboard/relatorio-simulado/:simuladoId?turma=<hashClassId>`.

## O que a tela diz

⚠️ **Escrito que o recorte é só cartão-resposta.** Um relatório que silenciosamente ignora quem
respondeu online gera "cadê o fulano?" na primeira semana. O `06` já diz isso dentro do relatório;
a lista precisa dizer também, porque é onde a pessoa decide entrar.

## Estados

- **Turma sem nenhum cartão:** estado vazio explicativo — *"nenhum simulado desta turma teve cartão
  enviado"*. O `04b` devolve lista vazia, não erro.
- **Carregando** e **erro**: explícitos, com como tentar de novo. Seguir o `ClassSimuladoAnalytics`,
  que é o vizinho de aba e já tem estados de verdade — **não** a aba de alunos, cujo único retorno é
  o toast do `useToastAsync`.

## Riscos

⚠️ **Nada disto está mergeado.** O `06` (client #689), o `04b` (ms #195 + api #552) e o `04`
(mergeado) formam a pilha. Se a ordem de merge inverter, a aba lista simulados e o link leva a uma
rota que não existe.

⚠️ **Buscar só quando a aba abre.** A tela de turma já faz duas chamadas no mount; uma terceira que
serve uma aba que a maioria não abre é custo por nada. Mesmo padrão do `06`, cuja aba de questões só
busca na primeira abertura.

⚠️ **Radix é caro no jsdom neste projeto** — poucos testes montando `Tabs`, cada um verificando tudo
de uma montagem só.

## Fora de escopo

- Qualquer conteúdo do relatório — é o `06`.
- O detalhe do estudante — card `07`.
- A página de acesso negado — card `10`.
- Reprocessar cartão — card `09`.

## Critérios de aceite

- [ ] Terceira aba na tela de turma, no padrão das duas existentes
- [ ] **A aba não aparece sem `gerenciarEstudantes`**, e o `04b` não é chamado
- [ ] Lista só os simulados com cartão **daquela turma** — o `turmaId` chega ao serviço
- [ ] Por simulado: nome, cartões, no cálculo da média, último envio
- [ ] Simulado com `nome` nulo continua na lista, rotulado e clicável
- [ ] Cada linha navega para o relatório do `06` **com `?turma=` aplicado**
- [ ] Busca só quando a aba abre, e não de novo ao alternar
- [ ] A tela diz que o recorte é só de cartão-resposta
- [ ] Turma sem nenhum cartão: estado vazio explicativo, não tabela em branco
- [ ] Carregando e erro explícitos, com como tentar de novo
- [ ] Nada do relatório reescrito aqui
