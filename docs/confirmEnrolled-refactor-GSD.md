# Refatoração: Tela de Confirmação de Matrícula (Declaração de Interesse)

**Documento GSD** — Plano de fases de implementação para separar o fluxo em etapas independentes, com persistência de estado na API e retomada de onde o usuário parou.

---

## 1. Visão geral do fluxo atual

### 1.1 Entrada na tela

- **Rota**: página de confirmação de matrícula (ex.: `/confirm-enrolled/:inscriptionId`).
- **Autenticação**: se não houver token, exibe `ConfirmEnrolledLogin`; caso contrário, exibe `ConfirmEnrolledPage`.
- **Validação inicial**: `verifyDeclaredInterest(inscriptionId, token)` (GET) retorna:
  - `expired`, `convocated`, `declared`, `isFree`, `studentId`, `requestDocuments`.
- **Decisão**: só entra no fluxo de declaração se `convocated === true`, `declared === false` e `!expired`. Caso contrário, mostra mensagem de erro/expirado/já declarado.

### 1.2 Fluxo de etapas (frontend)

- **Estado apenas em memória**: documentos (opcional), foto e pesquisa são acumulados no estado local do `DeclareInterest`.
- **Etapas** (enum `Steps`): Documentos → Foto Carteirinha → Pesquisa → Sucesso.
  - Documentos: exibida só se `requestDocuments === true`; arquivos em `uploadedFiles`.
  - Foto: obrigatória; arquivo em `uploadedPhoto`.
  - Pesquisa: áreas de interesse (`areaInterest`) e cursos (`selectedCursos`).
- **Envio único no final**: ao concluir a etapa Pesquisa, `handleSubmit` chama `declaredInterest(...)` **uma vez** com:
  - `uploadedFiles`, `uploadedPhoto`, `areaInterest`, `selectedCursos`, `studentId`, `token`.
- **Problemas atuais**:
  - Se o usuário sair e voltar, perde todo o progresso (não há “retomar de onde parou”).
  - Tudo é enviado no fim; falha em qualquer parte invalida o envio inteiro.
  - Não há noção de “etapas já cumpridas” na API.

### 1.3 Backend atual

- **Endpoint**: `PATCH /student-course/declared-interest`.
- **Payload**: multipart com `files`, `photo`, `areaInterest`, `selectedCourses`, `studentId`.
- **Comportamento**: um único handler processa documentos + foto + pesquisa e marca a declaração como feita (sem etapas intermediárias persistidas).

---

## 2. Objetivo da refatoração

- **Três etapas do ponto de vista do estudante**: (1) envio de documentos (se solicitado), (2) envio da foto da carteirinha, (3) envio da pesquisa (áreas/cursos).
- **Quatro momentos no back-end**: documentos, foto carteirinha, pesquisa e **confirmação de matrícula** (esta última só quando todas as etapas obrigatórias estiverem resolvidas; documentos podem ser opcionais).
- **Persistência por etapa**: cada etapa é enviada e persistida assim que o usuário conclui; a API expõe o estado de conclusão de cada uma.
- **Retomada**: ao acessar a tela, o frontend consulta o estado na API e inicia na primeira etapa **não concluída** (ou na confirmação, se todas estiverem concluídas).

---

## 3. Requisitos (para rastreamento)

| ID       | Descrição |
|----------|-----------|
| REQ-CE-01 | API expor estado de conclusão por etapa (documentos, foto, pesquisa) por estudante/inscrição. |
| REQ-CE-02 | Endpoints separados (ou um GET de estado + endpoints por etapa) para: documentos, foto, pesquisa, confirmação. |
| REQ-CE-03 | Documentos opcional (quando não for solicitado ou quando o cursinho não exigir). |
| REQ-CE-04 | Confirmação de matrícula (declaração final) só permitida quando foto e pesquisa estiverem concluídas; documentos conforme regra (obrigatório/opcional). |
| REQ-CE-05 | Frontend consultar estado ao carregar e exibir a primeira etapa pendente. |
| REQ-CE-06 | Frontend enviar cada etapa assim que for concluída (envio incremental, não apenas no final). |

---

## 4. Fases de implementação (GSD)

### Fase 1: Contrato e estado da API (backend)

**Objetivo**: Definir e implementar o modelo de “progresso por etapa” no back-end e o contrato que o frontend usará para saber “de onde retomar”.

**Entregas**:

- DTO/contrato de **estado de declaração** (ex.: `DeclarationProgressDto` ou equivalente):
  - `documentsDone: boolean` (ou `documentsSubmitted`; quando `requestDocuments === false`, considerar sempre true).
  - `photoDone: boolean`
  - `surveyDone: boolean` (pesquisa)
  - `declared: boolean` (declaração final confirmada)
- Endpoint **GET** (ex.: `GET /student-course/declaration-progress/:studentId` ou por `inscriptionId`, conforme modelo atual) que retorna esse estado.
- Persistência: uso das entidades/serviços existentes (student-course, uploads, etc.) para preencher esses campos a partir do que já existir (ex.: se já existir foto de perfil/documentos, considerar etapa concluída) e, a partir da Fase 2, atualizar ao receber cada etapa.

**Critérios de sucesso**:

1. Existir endpoint GET que retorna claramente quais etapas estão concluídas.
2. Contrato estável e documentado (OpenAPI/Swagger) para consumo pelo frontend.

**Dependências**: Nenhuma (pode depender do modelo atual de student/inscription).

---

### Fase 2: Endpoints por etapa no backend

**Objetivo**: Separar a lógica atual de `PATCH declared-interest` em três envios distintos + um de confirmação.

**Entregas**:

- **Documentos (quando solicitado)**  
  - Endpoint dedicado (ex.: `POST/ PATCH /student-course/declaration-documents` ou reutilizar `upload` existente com semântica “documentos da declaração”).  
  - Ao concluir com sucesso, marcar no estado que “documentos” está feito (persistir no modelo usado na Fase 1).

- **Foto carteirinha**  
  - Endpoint dedicado (ex.: `POST/ PATCH /student-course/declaration-photo` ou reutilizar upload de foto de perfil com contexto “declaração”).  
  - Ao concluir com sucesso, marcar “foto” como feita.

- **Pesquisa (áreas + cursos)**  
  - Endpoint dedicado (ex.: `POST/ PATCH /student-course/declaration-survey`) com body JSON: `areaInterest`, `selectedCourses`, `studentId` (e o que mais for necessário).  
  - Ao concluir com sucesso, marcar “pesquisa” como feita.

- **Confirmação de matrícula (declaração final)**  
  - Endpoint (ex.: `POST /student-course/declaration-confirm` ou `PATCH .../declared-interest` apenas para “confirmar”).  
  - Regra: só aceita se `photoDone && surveyDone && (documentsDone ou !requestDocuments)`.  
  - Ao concluir, marcar `declared = true` (equivalente ao comportamento atual de “declaração enviada”).

**Critérios de sucesso**:

1. Quatro momentos claros no back: documentos, foto, pesquisa, confirmação.
2. Confirmação só bem-sucedida quando as etapas obrigatórias estiverem resolvidas (documentos opcional conforme regra).
3. Estado retornado pelo GET da Fase 1 refletir as conclusões após cada chamada.

**Dependências**: Fase 1 (estado e GET de progresso).

---

### Fase 3: Integração do frontend com estado e retomada

**Objetivo**: Ao abrir a tela, buscar o estado na API e decidir em qual etapa o usuário deve entrar.

**Entregas**:

- Serviço (ou extensão do existente) que chama o **GET de progresso** (Fase 1) após `verifyDeclaredInterest` (ou em conjunto, conforme design).
- Combinar resposta do GET com `requestDocuments` para definir a **primeira etapa pendente**:
  - Se `declared === true` → mostrar tela de sucesso (já declarou).
  - Se não, se `requestDocuments && !documentsDone` → iniciar em Documentos.
  - Senão, se `!photoDone` → iniciar em Foto.
  - Senão, se `!surveyDone` → iniciar em Pesquisa.
  - Senão (tudo feito, mas não confirmado) → mostrar etapa de **Confirmação de matrícula** (botão “Confirmar declaração” que chama o endpoint da Fase 2).
- Ajustes em `ConfirmEnrolledPage` / `DeclareInterest`: uso do estado vindo da API para definir o `step` inicial e, se aplicável, pré-preencher dados já enviados (ex.: mostrar “Foto já enviada” na etapa de foto em vez de pedir novo upload).

**Critérios de sucesso**:

1. Usuário que sair e voltar é colocado na primeira etapa não concluída (ou na confirmação).
2. Não é necessário refazer etapas já concluídas para “chegar até o fim”.

**Dependências**: Fase 1 e Fase 2 (contrato e endpoints).

---

### Fase 4: Envio por etapa no frontend

**Objetivo**: Cada etapa envia seus dados assim que o usuário conclui, em vez de acumular tudo e enviar no final.

**Entregas**:

- **Documentos**: ao clicar “Continuar” na etapa de documentos, chamar o endpoint de documentos (Fase 2); em sucesso, avançar para Foto (e estado na API já reflete `documentsDone`).
- **Foto**: ao clicar “Continuar”, chamar o endpoint de foto; em sucesso, avançar para Pesquisa.
- **Pesquisa**: ao clicar “Enviar”, chamar o endpoint de pesquisa (sem enviar foto/documentos de novo); em sucesso, avançar para a etapa de **Confirmação** (ou diretamente para Sucesso, conforme regra de negócio).
- **Confirmação**: nova “mini-etapa” ou botão final que chama o endpoint de confirmação de matrícula; em sucesso, ir para `Steps.Sucess` (tela de sucesso).
- Remover ou deprecar o envio único que enviava tudo no `declaredInterest` atual (substituir por essa sequência de chamadas).
- Tratamento de erro por etapa: toast/feedback por falha em cada chamada, sem invalidar as outras etapas já concluídas.

**Critérios de sucesso**:

1. Nenhum envio “tudo de uma vez” no final; cada etapa persiste sozinha.
2. Falha em uma etapa não exige reenviar as anteriores (apenas repetir a etapa que falhou).
3. Fluxo completo: Documentos (se aplicável) → Foto → Pesquisa → Confirmação → Sucesso.

**Dependências**: Fase 3 (retomada e definição de etapas no front).

---

### Fase 5: Ajustes de UX e limpeza

**Objetivo**: Alinhar mensagens, stepper e comportamento ao novo fluxo e remover código legado.

**Entregas**:

- Stepper (ex.: `StepperCircle`) refletir quatro passos quando houver documentos (Documentos, Foto, Pesquisa, Confirmação) e três quando não houver (Foto, Pesquisa, Confirmação); “Sucesso” como estado final, não como passo clicável.
- Mensagens e textos: “Pré-Matrícula”, “Declaração de interesse”, confirmação final e sucesso consistentes com as novas etapas.
- Remoção do código do `PATCH declared-interest` antigo no cliente (e, quando aplicável, no servidor) após migração completa.
- Testes manuais/E2E: retomar de onde parou; concluir cada etapa; confirmação só habilitada quando permitido; documentos opcional.

**Critérios de sucesso**:

1. UX clara e consistente com as quatro etapas (ou três sem documentos).
2. Sem código morto do fluxo “tudo no final” no frontend (e backend conforme combinado).

**Dependências**: Fase 4.

---

## 5. Resumo da ordem de execução

| Ordem | Fase | Descrição |
|-------|------|-----------|
| 1 | Contrato e estado da API | GET de progresso por etapa; modelo de dados |
| 2 | Endpoints por etapa (backend) | Documentos, Foto, Pesquisa, Confirmação |
| 3 | Retomada no frontend | Carregar estado e iniciar na primeira etapa pendente |
| 4 | Envio por etapa no frontend | Uma chamada por etapa; confirmação no final |
| 5 | Ajustes de UX e limpeza | Stepper, textos, remoção do fluxo antigo |

---

## 6. Referência rápida de arquivos atuais

- **Frontend**
  - `client-vcnafacul/src/pages/confirmEnrolled/index.tsx` — entrada (login vs página).
  - `client-vcnafacul/src/pages/confirmEnrolled/confirmEnrolledPage.tsx` — validação inicial e renderização de `DeclareInterest` ou mensagens.
  - `client-vcnafacul/src/pages/confirmEnrolled/declareInterest.tsx` — fluxo de etapas e envio único atual.
  - `client-vcnafacul/src/pages/confirmEnrolled/steps/*` — Documentos, Foto, Pesquisa, Sucesso.
  - `client-vcnafacul/src/services/prepCourse/student/verifyDeclaredInterest.ts` — GET estado inicial.
  - `client-vcnafacul/src/services/prepCourse/student/declaredInterest.ts` — PATCH único atual.
  - `client-vcnafacul/src/services/urls.ts` — `declaredInterest` → `studentCourse/declared-interest`.
- **Backend**
  - `api-vcnafacul/.../student-course.controller.ts` — `PATCH('declared-interest')`.
  - `api-vcnafacul/.../student-course.service.ts` — método `declaredInterest` e lógica de confirmação de matrícula.

---

## 7. Observações

- **Documentos opcional**: em todo o fluxo, quando `requestDocuments === false`, a etapa “documentos” não é exibida e a regra de “todos resolvidos” para confirmação não exige documentos.
- **Compatibilidade**: durante a migração, pode ser necessário manter o `PATCH declared-interest` antigo até o frontend estar 100% nos novos endpoints; o plano assume desligamento após Fase 5.
- **Ids**: usar consistentemente `studentId` ou `inscriptionId` conforme o que o backend usar para identificar o estudante na declaração (o GET de progresso e os novos endpoints devem usar o mesmo identificador).

Este documento serve como plano GSD para a refatoração: cada fase pode ser quebrada em planos executáveis (ex.: 01-01-PLAN.md, 01-02-PLAN.md) no repositório de planejamento, se desejar integrar ao fluxo completo do Get Shit Done.
