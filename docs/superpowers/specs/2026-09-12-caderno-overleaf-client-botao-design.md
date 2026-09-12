# Card 06 · Botão "Baixar caderno" no client

**POC:** Caderno · Overleaf · **Branch:** `feature/caderno-06-client-botao` (de `poc/caderno-overleaf`, criada da `develop`)
**Card:** `docs/prova-latex-overleaf/cards/06-client-botao.md` · **Depende de:** card 05 (mergeado, api PR #541)

---

## O que é

O último card do caminho: põe o botão que o coordenador clica. O `api-vcnafacul` já expõe
`GET mssimulado/caderno/:simuladoId?draft=true`, atrás de `visualizar_provas`, devolvendo o zip com
`Content-Disposition: attachment` e o header `X-Caderno-Avisos`.

Fecha a POC ponta a ponta: template no repo → `.tex` gerados → imagens resolvidas → zip → proxy →
**botão**.

---

## Onde entra

`src/pages/dashProvas/modals/simuladosView.tsx`, na coluna de ações da tabela de simulados. Hoje ela
tem dois ícones: baixar cartão-resposta e editar janela.

### Três botões, nunca quatro

| estado do simulado | coluna de ações |
|---|---|
| pronto (`bloqueado === false`) | cartão · **caderno** · editar |
| bloqueado (`bloqueado === true`) | cartão *(desabilitado)* · **rascunho** · editar |

O botão de rascunho aparece **só** quando o simulado está bloqueado, e **só** com
`VITE_CADERNO_DRAFT === 'true'`. Sem a env, simulado bloqueado mostra o botão de caderno desabilitado
com tooltip.

⚠️ **Por que rascunho só no estado bloqueado.** É o estado para o qual ele foi feito: sai com marca
d'água e a caixa de pendências listando o que falta. Num simulado pronto, os dois botões ativos lado
a lado obrigam o usuário a escolher entre dois downloads quase iguais, sem informação para decidir.

O custo aceito: num simulado pronto não dá para gerar rascunho nem para conferir a marca d'água.

### Ícone diferente do cartão

⚠️ O botão do cartão usa `ArrowDownTrayIcon`. Repetir o mesmo ícone ao lado faz os dois lerem como um
botão duplicado — o usuário clica no errado e recebe o arquivo errado, que é pior do que não ter o
botão.

O caderno usa `DocumentArrowDownIcon` (já disponível: `@heroicons/react` está no projeto). O rascunho,
o mesmo ícone em tom apagado.

### Loading no botão, não só no toast

O `handleDownloadCartao` de hoje mostra `toast.loading` mas **deixa o botão clicável**. O caderno é
mais lento que o cartão — ele resolve imagens, e as externas passam por rede de terceiro — e clique
triplo dispara três gerações.

O botão desabilita enquanto voa, com indicador. ⚠️ **Só o botão daquela linha**: um estado booleano
único desabilitaria a tabela inteira, e o coordenador que quer baixar dois simulados esperaria sem
motivo. O estado guarda o `_id` em voo.

---

## Service

```
src/services/caderno/baixarCaderno.ts
```

```ts
export async function baixarCaderno(
  simuladoId: string,
  token: string,
  draft = false,
): Promise<{ blob: Blob; avisos: number }>;
```

`caderno` exportado em `src/services/urls.ts`, ao lado de `cartaoResposta`.

### Via `fetchWrapper`

Não `fetch` cru, apesar de o `baixarCartao` usar. O `fetchWrapper` renova o token expirado e refaz a
chamada; com `fetch` cru, um token vencido vira `401` e o usuário lê "erro ao baixar" sem saber que
bastava recarregar a página.

Vale mais aqui do que no cartão: a geração é mais lenta, então há mais janela para o token virar. E os
outros dois serviços da mesma pasta (`uploadCartao`, `buscarResultados`) já usam `fetchWrapper` — o
`baixarCartao` é que ficou para trás.

⚠️ `fetchWrapper` devolve `Response` cru e não toca no corpo. `.blob()` funciona igual.

### O erro precisa carregar a mensagem do backend

O `baixarCartao` faz `throw new Error("Erro ao baixar o cartão")` e descarta o corpo.

**O card 05 gastou uma task inteira para o `409` chegar legível até aqui** — desembrulhar o `Buffer`,
consertar o `handleError`, provar ponta a ponta que a frase *"simulado não está pronto (questões
pendentes ou incompletas)"* sobrevive. Descartá-la no client anula aquele trabalho.

Em resposta não-OK: lê o JSON, usa `message`, e cai numa genérica só se não houver corpo ou se ele não
for JSON.

⚠️ **Sucesso é binário, erro é JSON, e o corpo só pode ser lido uma vez.** Ler o corpo errado consome o
stream e o download quebra. A decisão é pelo `response.ok`, antes de tocar no corpo.

⚠️ O `try/catch` em volta do `.json()` não é cerimônia: um `502` de proxy reverso devolve HTML, e um
`.json()` solto lançaria `SyntaxError` — trocando uma mensagem útil por "Unexpected token <".

---

## Toast

| situação | toast |
|---|---|
| sucesso, `avisos === 0` | sucesso: "Caderno baixado" |
| sucesso, `avisos > 0` | **warning**: "Caderno gerado com N observações — confira as questões marcadas" |
| erro | erro, **com a mensagem do backend** |

⚠️ Aviso é `warning`, não `success`. O download funcionou, mas há algo para conferir antes de imprimir
— e é este toast que devolve a responsabilidade a quem cadastrou a questão. Um `success` verde faz a
pessoa fechar sem ler.

O padrão de `toast.loading` + `toast.update` do `handleDownloadCartao` é o molde.

## Micro-copy

O tooltip do botão ativo deixa claro que o download é **um pacote para abrir no Overleaf**, não a prova
pronta em PDF. Sem isso, o coordenador baixa esperando um PDF e encontra um zip com `.tex` dentro.

O tooltip do botão desabilitado explica o que falta: o simulado precisa estar com todas as questões
cadastradas, aprovadas e numeradas.

O `LEIA-ME.txt` dentro do zip (card 00) cobre o resto.

---

## Verificação: este projeto não tem testes

⚠️ **Medido: o `client-vcnafacul` não tem infraestrutura de teste nenhuma** — nenhum runner
(`vitest`/`jest` não estão nas dependências), nenhuma config, nenhum arquivo `.test.` ou `.spec.` no
`src/`. O único script de verificação é `lint`.

Isto **corrige o que foi dito no desenho verbal**, onde falei em testes de service e de componente.
Não há onde escrevê-los.

### E o `npm run lint` está quebrado

⚠️ Medido durante a execução, e **pré-existente**: `npm run lint` não roda neste repo, na `develop`
inclusive.

| | |
|---|---|
| ESLint declarado e instalado | **9.39.4** (`^9.0.0` no `package.json`) |
| config presente | `.eslintrc.cjs` — formato **legado**, que a v9 não lê por padrão |
| script | usa `--ext`, flag **removida** na v9 |
| CI que roda lint | **nenhum** — por isso ninguém notou |

Rodando pelo caminho de compatibilidade (`ESLINT_USE_FLAT_CONFIG=false`), o repo tem **155 problemas
pré-existentes** (84 erros, 71 avisos) em arquivos que este card não toca. Ou seja: o critério "zero
warnings" do card **já não era verdade** antes deste trabalho.

**Consertar isso não entra aqui.** Migrar para flat config e zerar 155 problemas é tarefa de projeto,
não de um card que acrescenta um botão. **Registrado como observação, com prioridade** — sem lint e
sem testes, este repo não tem verificação automática nenhuma.

A verificação deste card é, portanto:

- `ESLINT_USE_FLAT_CONFIG=false npx eslint <arquivos deste card>` — limpo
- `npx tsc --noEmit`
- `npm run build`
- **gate manual**, que aqui não é opcional: é a única prova de comportamento

⚠️ **Introduzir `vitest` não entra neste card.** É decisão de projeto — dependência nova, config, CI —
e um card de POC que acrescenta um botão não é o lugar de tomá-la. **Registrado como observação.**

## Gate manual

Com o client apontando para uma api que tenha o card 05:

1. Simulado **pronto**: o botão de caderno aparece, baixa `caderno_<nome>.zip`, e o zip abre
2. Durante o download o botão fica desabilitado; **clique triplo não dispara três downloads**
3. Só a linha clicada desabilita — as outras seguem clicáveis
4. Simulado **bloqueado**: o de caderno aparece desabilitado, com tooltip
5. Com `VITE_CADERNO_DRAFT=true`, o de rascunho aparece no bloqueado e baixa
6. Um erro do backend vira toast **com a frase do backend**, não "erro ao baixar"
7. Simulado com avisos: toast de warning com a contagem
8. O botão do cartão continua funcionando

## Critérios de aceitação

- [ ] Os 8 pontos do gate
- [ ] `ESLINT_USE_FLAT_CONFIG=false npx eslint <arquivos deste card>` limpo (o `npm run lint` do projeto está quebrado — ver acima)
- [ ] `npx tsc --noEmit` limpo
- [ ] `npm run build` limpo
- [ ] `.env.example` com `VITE_CADERNO_DRAFT`
- [ ] Nenhuma mudança no `baixarCartao` nem no botão dele

## Risco

**Baixo** de lógica — é UI pequena num componente que já faz isto para o cartão.

**Médio de verificação**, e por um motivo que não é do card: sem runner de teste, tudo o que este card
afirma depende do gate manual. Um erro aqui não é pego por CI.

## O que este card NÃO faz

**Não migra o `baixarCartao` para `fetchWrapper`** nem mexe no botão dele. Mesmo argumento do card 05:
caminho de download em produção, sem o card pedir. Registrado.

**Não introduz runner de teste.** Ver acima.

**Não conserta o `npm run lint`.** Migrar para flat config e zerar 155 problemas pré-existentes é
tarefa de projeto. Registrado.

**Não esconde o botão em prova ENEM oficial.** O card levanta isso como consequência de uma decisão de
direito autoral que **ainda não foi tomada** (pergunta 3 do README da POC). Enquanto ela não for, o
botão aparece para todo simulado. Se a decisão for "só categorias custom", a checagem entra no
`ms-simulado`, junto do gate, para não duplicar regra — e o client só deixa de ver o botão.
