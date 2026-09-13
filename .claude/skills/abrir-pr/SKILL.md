---
name: abrir-pr
description: Abre PR no client-vcnafacul rodando antes a suíte COMPLETA de testes localmente. Use sempre que for abrir um pull request neste repositório — o CI não roda todos os testes.
---

# Abrir PR no client-vcnafacul

⚠️ **O CI deste repositório não roda a suíte completa.** Ele usa `yarn test:ci`, que exclui
`src/components/dashV2/DashToolbar.test.tsx` — 22 testes que o pipeline não cobre. **Esta skill é a
única coisa que os executa antes de um merge.** Não pule nenhum passo.

## Por que o CI não roda tudo

`DashToolbar.test.tsx` leva ~38 s dos 50 s da suíte. Popover e Tooltip do Radix degradam o jsdom de
forma **progressiva**: no probe controlado, o 1º teste que abre um popover custa 676 ms, o 3º custa
4243 ms, e um 4º que **não abre nada** ainda custa 3050 ms. Com isso a suíte passava dos ~135 s que o
RPC do vitest tolera no runner, e a pipeline falhava com `Timeout calling "onTaskUpdate"` **e todos os
testes verdes**.

A causa raiz não foi encontrada. As hipóteses já descartadas por medição estão no docblock no fim
daquele arquivo — leia antes de tentar de novo.

## Passos

Execute **na ordem** e **pare no primeiro que falhar**.

### 1. A suíte completa — inclusive o que o CI não roda

```bash
yarn test
```

Esperado: **todos** os arquivos verdes, incluindo `DashToolbar.test.tsx`. Leva ~50 s; é normal.

⚠️ **Confira a contagem, não só a ausência de `FAIL`.** Um arquivo corrompido produz
`Tests  no tests` com `FAIL`, o que parece falha de asserção e não é. Se o número de testes cair sem
você ter removido nenhum, investigue antes de seguir.

⚠️ Se aparecer `Errors  1 error` **depois** de `Tests ... passed`, é o problema de RPC descrito acima
— e aí o `yarn test:ci` também precisa ser conferido, porque o CI vai reagir diferente.

### 2. O build

```bash
yarn build
```

`tsc` + `vite build`. O CI roda isto, então uma falha aqui reprova o PR de qualquer forma.

⚠️ O build suja `tsconfig.app.tsbuildinfo`, que é **rastreado**. Restaure antes de commitar:
`git checkout -- tsconfig.app.tsbuildinfo`.

### 3. Confirme o que o CI vai ver

```bash
yarn test:ci
```

Se este passar e o `yarn test` do passo 1 tiver falhado, **não abra o PR** — o CI ficaria verde
escondendo um teste quebrado, que é exatamente o cenário que esta skill existe para impedir.

### 4. Revise o próprio diff

```bash
git log --oneline develop..HEAD
git diff develop...HEAD --stat
```

Procure: `console.log`, `.only` em `describe`/`it`, arquivo fora do escopo do trabalho, e qualquer
mudança em `yarn.lock` que você não tenha feito de propósito.

### 5. Abra o PR

```bash
git push -u origin <branch>
gh pr create --base develop --title "<título>" --body-file <arquivo>
```

⚠️ **Branches encadeadas: abra o PR só da ponta.** A branch da ponta já contém os commits das
anteriores; um PR por branch cria PRs redundantes que precisam ser fechados à mão.

No corpo, registre:

- o que muda e **por quê**, não só o quê;
- decisões tomadas contra o que o ticket pedia, com a medição que as justifica;
- o que **não** foi verificado — em especial o que jsdom não alcança (layout, densidade, sticky,
  truncamento);
- **que os 22 testes de `DashToolbar.test.tsx` foram rodados localmente**, já que o CI não os mostra.

## Não faça

- ⚠️ **Não rode `npm run lint` nem `yarn lint`** — está quebrado no repo (ESLint 9 procurando
  `eslint.config.js` com `.eslintrc.cjs` legado). Para verificar arquivos específicos:
  `ESLINT_USE_FLAT_CONFIG=false npx eslint <caminhos explícitos>`.
- ⚠️ **Não use `git add -A` nem `git add .`.** Sempre caminhos explícitos.
- ⚠️ **Não rode `yarn install` sem necessidade.** Use `--frozen-lockfile`, que falha em vez de
  reescrever o lockfile.
