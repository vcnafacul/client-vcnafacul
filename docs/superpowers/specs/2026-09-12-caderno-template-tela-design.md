# Card 13 · A tela do template do caderno

**Etapa:** Caderno · Overleaf · **Branch:** `feature/caderno-13-template-tela` (de `develop`)
**Card:** `docs/prova-latex-overleaf/cards/13-client-upload-template.md`
**Bloqueado por:** card 12 (`api#543`, aberto) · **Fecha a etapa**

---

## O que é

Um botão na `DashProva` e um modal. A tela **não edita nada** — ela move arquivo e mostra estado. Toda
edição acontece no Overleaf, que é o único lugar onde dá para ver o resultado.

É o último card da etapa, e é ele que destrava o teste do ciclo completo: baixar o modelo, editar no
Overleaf, subir de volta, publicar.

---

## O que foi verificado antes de escrever

| premissa | medido |
|---|---|
| o client tem testes | ✅ vitest + testing-library, e **o CI roda `yarn test`** (`ci-homol.yml:46`) |
| `npm run lint` funciona | ❌ **quebrado** — ESLint 9 não acha `eslint.config.js`, o repo tem `.eslintrc.cjs` legado |
| o CI roda lint | ❌ só `yarn install --frozen-lockfile`, `yarn test` e `yarn build` |
| `alterarPermissao` existe no client | ✅ `src/enums/roles/roles.ts:3` |
| há precedente de `FormData` | ✅ `services/cartaoResposta/uploadCartao.ts` |
| há precedente de download binário | ✅ `services/caderno/baixarCaderno.ts` (card 06) |
| o slot de botão de gerenciamento | ✅ `pages/dashProvas/index.tsx:283-320` |
| o card 14 está pendente | ❌ **já mergeado** (`#677`) |

### A descoberta que valida a permissão

**"Gerenciar Categorias", o botão vizinho nesta mesma tela, já é gateado por `alterarPermissao`**
(`index.tsx:309`). O botão novo senta ao lado dele, com o mesmo gate. A decisão do card 12 encaixa no
padrão que a tela já tem.

⚠️ **O card pede "visível só para quem tem", e o repo usa `disabled`.** Sigo o repo: um botão
desabilitado no meio de habilitados é a affordance que esta tela já usa, e esconder criaria duas
convenções na mesma barra.

⚠️ **O card cita a permissão `gerenciarTemplateCaderno`, que não existe.** Ela foi descartada no card
12 em favor de `alterarPermissao` — a spec de lá registra o porquê e a saída.

---

## O lint fica para outro card

O critério do card — *"`npm run lint` com zero warnings (o projeto exige)"* — **é impossível de cumprir
como escrito**: o comando não lint-a nada, sai com erro de configuração.

Migrar para o flat config do ESLint 9 muda o status de lint de **todo** arquivo do repo. Num PR de
feature, isso torna o diff irrevisável: ninguém separa a tela nova dos 155 problemas pré-existentes.

**O portão deste card é `yarn test` + `yarn build`** — exatamente o que o CI cobra.

---

## Estrutura

```
src/services/caderno/template/
├── baixarModelo.ts        GET  /mssimulado/caderno/template/teste[?versao=N]
├── subirRascunho.ts       POST /mssimulado/caderno/template/rascunho  (multipart)
├── obterRascunho.ts       GET  …/rascunho
├── descartarRascunho.ts   DELETE …/rascunho
├── publicar.ts            POST …/rascunho/publicar
├── listarVersoes.ts       GET  …/versoes
├── restaurar.ts           POST …/versoes/:n/restaurar
└── tipos.ts               as formas que a api devolve

src/pages/dashProvas/modals/manageTemplate/
├── index.tsx              o modal: três passos + o rascunho
├── historico.tsx          a aba de versões
├── estados.ts             a máquina de estados. PURA.
└── confirmarDescarte.tsx  no molde do deleteConfirm.tsx
```

O molde do modal é `modals/manageCategorias/`, ao lado. O dos services é
`services/caderno/baixarCaderno.ts`.

---

## As quatro armadilhas

Três já estão documentadas no próprio repo, por cards anteriores. A quarta é nova.

### 1. Sucesso é binário, erro é JSON — e o corpo só pode ser lido uma vez

O `baixarCaderno.ts` já traz o comentário: decidir pelo `response.ok` **antes** de tocar no corpo. Ler
o errado consome o stream e o download quebra.

Vale igual para `baixarModelo`, que tem a mesma forma.

### 2. `FormData` sem `Content-Type`

O browser põe o boundary; declarar o header o substitui por um sem boundary e o servidor recebe um
corpo que não parseia. O `uploadCartao.ts` já faz certo e comenta.

⚠️ É a mesma classe de defeito que o card 12 mediu do outro lado: lá, um `append` sem filename
transformou o zip em **texto** sem erro nenhum, e dois testes continuaram verdes.

### 3. `fetchWrapper`, não `fetch` cru

O `baixarCartao.ts` usa `fetch` e perde a renovação de token — um token vencido vira "erro ao baixar",
sem dizer que bastava recarregar. O `baixarCaderno.ts` corrigiu e explicou. Sigo o segundo.

### 4. ⚠️ O upload responde `200` COM erros — e esta é a que arruína a feature

`POST /rascunho` devolve **sucesso HTTP** e um relatório que pode ter `erros` preenchido. É de
propósito: o rascunho é salvo mesmo reprovando no lint, para o coordenador não perder o zip que acabou
de editar.

Um service que trate `response.ok` como "deu tudo certo", e uma tela que mostre "enviado com sucesso",
fazem ele **achar que publicou**. Ele fecha o modal, e a prova seguinte sai com o template velho.

**O service devolve o relatório inteiro. Quem decide o que mostrar é a máquina de estados.**

---

## A máquina de estados

Os quatro estados viram função pura em `estados.ts`:

| estado | como se chega | Publicar |
|---|---|---|
| sem rascunho | não há rascunho | — |
| rascunho com erro | relatório com `erros` não vazio | **desabilitado** |
| rascunho limpo | relatório com `erros` vazio | habilitado |
| publicado | depois do `publicar` | volta a "sem rascunho" |

Ela responde: *o Publicar está habilitado?*, *o que aparece na lista de ignorados?*, *que versão está no
topo?*

Separar não é cerimônia: é o que permite testar sem renderizar MUI, e é exatamente onde o card diz que
telas assim erram.

---

## O que a tela mostra e normalmente se esquece

**Os arquivos ignorados.** O zip do Overleaf traz o projeto inteiro e a plataforma pega dois arquivos.
Sem essa lista, ele acha que subiu mais do que subiu — e um dia jura que trocou a logo pela tela.

**Os erros de lint em português, com arquivo e consequência.** Não um blob de JSON:

```
Não foi possível publicar:
• main.tex — falta \input{conteudo}
  O caderno compilaria, mas sairia sem nenhuma questão.
```

**Qual versão está no ar**, sempre no topo, com data e autor.

**Restaurar não é reverter.** A confirmação diz: *"isto cria um rascunho a partir da v2. A v4 continua
publicada até você publicar o rascunho."*

---

## O texto do passo 2

O card manda copiar o texto do `LEIA-ME.txt` para a instrução ser a mesma nos dois lugares.

⚠️ **Copiar literal não funciona, e o motivo importa.** O card 11 reescreveu aquele arquivo, e a
redação nova diz: *"baixe o projeto inteiro pelo Download do Overleaf e entregue esse .zip a essa
pessoa"* — ela fala com quem **não** pode publicar, e manda procurar quem pode.

**Quem lê esta tela é essa pessoa.** Copiar literal mandaria o administrador entregar o zip a si mesmo.

O que precisa casar é a **substância**, não a letra: o artefato é o zip do projeto inteiro, baixado
pelo "Download" do Overleaf; não se separa arquivo nenhum, porque a plataforma pega os dois de dentro;
e a fonte da verdade é a versão publicada.

⚠️ E as três instruções ficam **na tela**, não em tooltip: quem usa isto abre a tela uma vez por
trimestre e não vai lembrar da ordem.

---

## Testes

Com vitest, que o CI roda.

**Services** (mockando o módulo `fetchWrapper`, não o `fetch` global):

⚠️ Mockar o `fetch` global arrastaria a lógica de renovação de token do `fetchWrapper` para dentro de
todo teste de service, junto com as stores de que ela depende. O que estes testes precisam provar é o
que o service **monta** e como ele **interpreta a resposta** — o wrapper tem dono próprio.
- `subirRascunho` monta `FormData` com o arquivo e **não** declara `Content-Type`
- `subirRascunho` devolve o relatório **mesmo quando `erros` não está vazio** — não trata como falha
- `baixarModelo` decide por `response.ok` antes de ler o corpo; erro em JSON vira mensagem, e não
  quebra o download
- `baixarModelo` monta `?versao=N` quando pedido
- `restaurar` e `descartarRascunho` batem no verbo e na rota certos
- um `502` que devolve HTML não vira `SyntaxError`

**Máquina de estados** (pura):
- relatório com `erros` → **Publicar desabilitado**. É o teste que impede o defeito que arruína a feature
- relatório com `avisos` e sem `erros` → Publicar **habilitado** (aviso não bloqueia; foi decisão do
  card 10)
- os ignorados aparecem na lista
- depois de publicar, o estado volta para "sem rascunho" e o topo mostra a versão nova

⚠️ **Sem testes de renderização de MUI.** Eles quebram por mudança de markup sem mudança de
comportamento, e este repo ainda não tem prática de mantê-los.

---

## Critérios de aceitação

Os do card, com três correções:

- [ ] O botão usa **`alterarPermissao`** e fica **desabilitado** (não escondido), como o vizinho
- [ ] ~~`npm run lint` com zero warnings~~ → **`yarn test` e `yarn build` limpos**
- [ ] O texto do passo 2 casa em **substância** com o `LEIA-ME.txt` do card 11, endereçado a quem pode publicar

E mais:

- [ ] Upload com erro de lint mostra os erros e **não** diz "enviado com sucesso"
- [ ] Publicar desabilitado com erro; habilitado com aviso
- [ ] Clique duplo não dispara dois uploads nem duas publicações
- [ ] Zip inválido → mensagem clara, sem quebrar a tela
- [ ] Sem regressão no "Gerenciar Categorias" ao lado

---

## Risco

**Baixo.** Não há editor, não há estado compartilhado editado em duas abas, não há merge.

O risco real é de **texto**: a tela é lida por alguém que a abre uma vez por trimestre, e a diferença
entre "enviado" e "publicado" decide se a prova sai com o layout certo. Por isso a armadilha 4 tem
teste, e por isso o passo 2 tem uma seção só para ele nesta spec.

## O que este card NÃO faz

**Não conserta o ESLint** — card separado, pelo motivo registrado acima.
**Não cria permissão** — usa `alterarPermissao`, decidido no card 12.
**Não edita LaTeX na plataforma** — a versão anterior deste card propunha um editor, e ele caiu quando
o fluxo passou a incluir o Overleaf por construção.
