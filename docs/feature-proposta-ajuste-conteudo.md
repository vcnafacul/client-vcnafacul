## Plano de Implementação – Proposta de Ajuste de Conteúdo

### 1. Contexto Atual

- **Página**: `src/pages/dashContent/index.tsx`
  - Usa `DashCardTemplate` e `DashCardContext` para listar conteúdos (`ContentDtoInput`) em forma de cards.
  - Abre modais conforme status e permissões:
    - `ShowDemand`: usado quando a demanda está em `StatusContent.Pending_Upload` e o usuário possui permissão de upload (`Roles.uploadDemanda`).
    - `ValidatedDemand`: usado quando o conteúdo já tem arquivo ou o usuário não é uploader (fluxo de validação/review).
- **Upload inicial de arquivo**:
  - Implementado em `ShowDemand`:
    - Upload de `.docx` com preview (`DocxPreview`).
    - Envia arquivo via `uploadFileDemand(demandId, formData, token)`.
    - Ao sucesso, atualiza lista (via `updateStatusDemand`) e fecha o modal.
- **Visualização e workflow de aprovação**:
  - Implementado em `ValidatedDemand`:
    - Busca o arquivo atual via `getFile(fileId, token)` e exibe (download + visualização com `DocxPreview`).
    - Permite ações de workflow: `Aprovar`, `Rejeitar`, `Resetar`, usando `updateStatus` e `resetDemand`.
    - Permissões de revisão controladas por `Roles.validarDemanda` (`canReview`).

### 2. Objetivo da Nova Funcionalidade

- **Problema atual**: após o primeiro upload, não existe um fluxo estruturado para propor alterações no conteúdo sem substituir imediatamente o arquivo vigente.
- **Objetivo**:
  - Permitir que usuários criem **Propostas de Ajuste** de conteúdo, enviando um novo `.docx` associado a um conteúdo que **já possui arquivo**.
  - A proposta **não substitui automaticamente** o arquivo atual: ela fica em estado pendente de avaliação.
  - Um revisor (perfil com permissão) pode **aprovar** ou **rejeitar** a proposta:
    - **Aprovar**: o arquivo vigente do conteúdo passa a ser o arquivo da proposta.
    - **Rejeitar**: o arquivo vigente permanece, e a proposta fica marcada como rejeitada.
  - Manter um **histórico de todos os arquivos** associados ao conteúdo (upload inicial + versões aprovadas).
  - Exibir **quem fez a última edição** e **quando** diretamente no card do conteúdo, e o histórico completo (todas as versões) no modal de visualização.

### 3. Requisitos Funcionais

#### 3.1. Botão “Proposta de Ajuste”

- No modal de visualização de conteúdo com arquivo (`ValidatedDemand`), deve existir um botão **“Proposta de Ajuste”**.
- Condições para exibir o botão:
  - O conteúdo precisa ter arquivo associado (`demand.file` ou `fileId` definido).
  - Usuário deve possuir permissão para propor ajustes (por exemplo, `Roles.uploadDemanda` ou um novo papel dedicado).

#### 3.2. Modal de Criação de Proposta de Ajuste

- Ao clicar em **“Proposta de Ajuste”**:
  - Abrir um novo modal, por exemplo `AdjustmentProposalModal`.
  - Funcionalidades:
    - Upload de arquivo `.docx` via input/área de drop (similar a `ShowDemand`).
    - Preview opcional com `DocxPreview` (usando `arrayBuffer` lido via `FileReader`).
    - Campos básicos:
      - Arquivo `.docx` obrigatório.
      - Comentário opcional (justificativa da proposta).
    - Botões:
      - **Salvar Proposta** (envia para backend).
      - **Cancelar** (fecha modal).
  - Ao salvar a proposta:
    - Enviar `FormData` com `file` (e opcionalmente `comment`) para um novo endpoint de criação de proposta.
    - Exibir feedback com `useToastAsync` (loading/sucesso/erro).
    - Fechar o modal ao sucesso.
    - Não alterar o arquivo vigente do conteúdo.

#### 3.3. Listagem e Gestão de Propostas de Ajuste

- Ao abrir `ValidatedDemand` para uma demanda com arquivo:
  - Carregar as propostas de ajuste associadas ao conteúdo, via serviço `getAdjustmentProposals(demandId, token)`.
  - Exibir seção “Propostas de Ajuste”:
    - Lista (ou tabela) com colunas sugeridas:
      - Autor da proposta.
      - Data/hora de criação.
      - Status (`PENDING`, `APPROVED`, `REJECTED`).
      - Ações:
        - **Visualizar** (preview do arquivo proposto).
        - **Download**.
        - **Aprovar** / **Rejeitar** (para quem tem permissão de revisão).
  - Filtragem mínima:
    - Exibir pelo menos as propostas **pendentes**; opcionalmente mostrar histórico completo.

#### 3.4. Aprovar Proposta de Ajuste

- Ao clicar em **Aprovar** numa proposta:
  - Chamar endpoint de aprovação (`approveAdjustmentProposal(proposalId, token)`).
  - Backend deve:
    - Marcar a proposta como `APPROVED`.
    - Substituir o arquivo atual do conteúdo pelo arquivo da proposta.
    - Registrar entrada em histórico de arquivos (ver seção 4).
    - Atualizar campos de “última edição” no conteúdo (`lastEditedBy`, `lastEditedAt`).
  - Frontend:
    - Usar `useToastAsync` para loading/sucesso/erro.
    - Ao sucesso:
      - Atualizar lista de propostas em memória (removendo a proposta das pendentes ou marcando como aprovada).
      - Recarregar o arquivo atual (chamando `getFile` novamente ou atualizando `blob/arrayBuffer`).
      - Opcionalmente atualizar o histórico de arquivos exibido no modal.

#### 3.5. Rejeitar Proposta de Ajuste

- Ao clicar em **Rejeitar** numa proposta:
  - Chamar endpoint de rejeição (`rejectAdjustmentProposal(proposalId, token)`).
  - Backend:
    - Atualiza status da proposta para `REJECTED`.
    - Não altera o arquivo atual do conteúdo.
  - Frontend:
    - Atualizar a lista de propostas (remover das pendentes ou exibir como rejeitada).
    - Mostrar feedback com `useToastAsync`.

### 4. Histórico de Arquivos por Conteúdo

#### 4.1. Objetivo

- Manter um **histórico completo de versões de arquivo** relacionadas a um conteúdo:
  - Upload inicial.
  - Cada aprovação de proposta de ajuste.
- Permitir:
  - Exibir esse histórico no modal de visualização.
  - Mostrar rapidamente quem fez a última edição e quando no card do conteúdo.
  - Opcionalmente, permitir o download de versões antigas para auditoria.

#### 4.2. Estrutura de Dados (Backend)

- Nova entidade (exemplo): `ContentFileHistory`:
  - `id: string`
  - `contentId: string` (referência ao conteúdo/demanda)
  - `fileId: string` (arquivo armazenado)
  - `originalName: string` (nome original do upload)
  - `version: number` (1 para upload inicial, 2 para primeira alteração aprovada, etc.)
  - `changedBy: string` (id ou nome do usuário)
  - `changedAt: Date`
  - `changeSource: "UPLOAD_INICIAL" | "PROPOSTA_APROVADA"`
  - (Opcional) `comment?: string` (justificativa ou descrição da mudança)

- Decisão de modelagem:
  - Pode ser uma coleção/tabela dedicada de histórico.
  - Ou um array no próprio documento de conteúdo (dependendo do banco e convenções do projeto).

#### 4.3. Atualizações Automáticas no Backend

- **Upload inicial (`uploadFileDemand`)**:
  - Ao concluir com sucesso:
    - Criar entrada em `ContentFileHistory`:
      - `version = 1` (ou próximo número disponível).
      - `changeSource = "UPLOAD_INICIAL"`.
      - `changedBy` = usuário autenticado.
      - `changedAt` = data/hora atual.
    - Atualizar no documento do conteúdo:
      - `lastEditedBy` = usuário autenticado.
      - `lastEditedAt` = data/hora atual.

- **Aprovação de proposta de ajuste (`approveAdjustmentProposal`)**:
  - Ao concluir com sucesso:
    - Substituir o arquivo atual pelo arquivo da proposta.
    - Criar nova entrada em `ContentFileHistory`:
      - `version = versãoAnterior + 1`.
      - `changeSource = "PROPOSTA_APROVADA"`.
      - `changedBy` = usuário aprovador.
      - `changedAt` = data/hora.
      - `comment` = comentário da proposta (se existir).
    - Atualizar dados agregados no conteúdo:
      - `lastEditedBy` e `lastEditedAt`.

#### 4.4. Endpoints para Histórico

- **Listar histórico de um conteúdo**:
  - `GET /contents/:contentId/file-history`
  - Retorna array de `ContentFileHistory` ordenado por `version` ou `changedAt` (decrescente).

- **Download de uma versão específica (opcional)**:
  - `GET /contents/:contentId/file-history/:historyId/file`
  - Permite baixar uma versão antiga do arquivo.

### 5. Novo Fluxo no Frontend

#### 5.1. Serviços (camada de API)

No módulo de serviços de conteúdo (ex.: `src/services/content`):

- **Propostas de ajuste**:
  - `createAdjustmentProposal(contentId, formData, token)`
  - `getAdjustmentProposals(contentId, token)`
  - `approveAdjustmentProposal(proposalId, token)`
  - `rejectAdjustmentProposal(proposalId, token)`
  - (Opcional) `getAdjustmentProposalFile(proposalId, token)` se não reutilizar `getFile`.

- **Histórico de arquivos**:
  - `getFileHistory(contentId, token)`
  - (Opcional) `downloadFileHistoryVersion(historyId, token)` se exposto pelo backend.

#### 5.2. Ajustes em `ValidatedDemand`

- **Estados adicionais**:
  - `proposals`: lista de propostas de ajuste.
  - `selectedProposal`: proposta atualmente selecionada para preview/ação.
  - `fileHistory`: lista de versões de arquivo (`ContentFileHistory`).

- **Carregamento inicial (useEffect)**:
  - Além do fluxo atual que busca o arquivo via `getFile`:
    - Chamar `getAdjustmentProposals(demandId, token)` para carregar propostas.
    - Chamar `getFileHistory(demandId, token)` para carregar histórico de versões.

- **Modais adicionais via `useModals`**:
  - `adjustmentProposal` (criação de proposta).
  - `proposalPreview` (visualização de arquivo da proposta, se for separado do preview do arquivo atual).

- **Seção “Propostas de Ajuste”**:
  - Renderizada abaixo das informações gerais e dos botões de download/visualização do arquivo atual.
  - Tabela ou lista com:
    - Autor da proposta.
    - Data/hora.
    - Status.
    - Botões:
      - `Visualizar` → abre `proposalPreview` com `DocxPreview`.
      - `Download` → dispara download do arquivo da proposta.
      - `Aprovar` → chama `approveAdjustmentProposal`.
      - `Rejeitar` → chama `rejectAdjustmentProposal`.
  - Ações de aprovação/rejeição respeitam `canReview` (permissão `Roles.validarDemanda`).

- **Seção “Histórico de Arquivos”**:
  - Renderizada abaixo (ou ao lado) das propostas.
  - Cada item de histórico exibe:
    - `Versão X`.
    - Nome do arquivo.
    - Usuário (`changedBy`).
    - Data/hora (`changedAt`).
    - Origem (`Upload inicial` / `Proposta aprovada`).
    - (Opcional) Ação de download da versão específica.

#### 5.3. Novo Modal `AdjustmentProposalModal`

- Local: `src/pages/dashContent/modals/AdjustmentProposalModal.tsx` (sugestão).
- Comportamento:
  - Estrutura semelhante a `ShowDemand`:
    - Input de arquivo `.docx` com `FileReader` para gerar `arrayBuffer`.
    - Preview com `DocxPreview` se o arquivo for válido.
  - Botão **Salvar Proposta**:
    - Desabilitado enquanto não houver arquivo válido.
    - Ao clicar:
      - Monta `FormData` com o arquivo e campos adicionais (ex.: `comment`).
      - Chama `createAdjustmentProposal(contentId, formData, token)` via `useToastAsync`.
      - Ao sucesso:
        - Atualiza `proposals` em `ValidatedDemand` (via callback ou refetch).
        - Fecha o modal.

### 6. Exibição de Última Edição no Card

#### 6.1. Campos adicionais no DTO de Conteúdo

- No backend, no DTO que alimenta os cards (`ContentDtoInput` ou equivalente), incluir:
  - `lastEditedBy: string`
  - `lastEditedAt: Date`

- Esses campos são atualizados sempre que:
  - Um arquivo é enviado pela primeira vez (`uploadFileDemand`).
  - Uma proposta de ajuste é aprovada (`approveAdjustmentProposal`).

#### 6.2. Transformação para Card (`cardTransformationContent`)

- Atualizar a função de transformação dos cards para incluir:
  - Uma linha de informação do tipo:
    - `Última edição por <lastEditedBy> em <data formatada>`.
  - Exibir essa informação em local consistente no card (por exemplo, rodapé ou subtítulo).

#### 6.3. Integração com `DashCardTemplate`

- Como `DashCardTemplate` consome o contexto `DashCardContext` (`entities`, `cardTransformationContent`, etc.), basta:
  - Garantir que:
    - `getContent` já traga `lastEditedBy` e `lastEditedAt`.
    - `cardTransformationContent` leia esses campos e os inclua no modelo de card.

### 7. Permissões e Regras de Negócio

- **Criação de Proposta de Ajuste**:
  - Apenas para conteúdos com arquivo vigente.
  - Usuários com permissão (ex.: `Roles.uploadDemanda` ou papel específico).

- **Aprovação/Rejeição de Propostas**:
  - Usuários com `Roles.validarDemanda` (reutilizando a mesma lógica de `canReview`).
  - Regra opcional de negócio:
    - O mesmo usuário que criou a proposta não pode aprová-la (validação no backend).

- **Acesso ao Histórico**:
  - Leitura geralmente aberta para perfis que já podem visualizar o conteúdo.
  - Restrições adicionais podem ser implementadas via backend, conforme necessidade.

### 8. Passos de Implementação (Resumo)

1. **Backend – Propostas de ajuste**:
   - Criar entidade de proposta (`ContentAdjustmentProposal`).
   - Endpoints:
     - `POST /contents/:contentId/adjustment-proposals` (criar proposta).
     - `GET /contents/:contentId/adjustment-proposals` (listar, com filtro de status).
     - `GET /contents/adjustment-proposals/:proposalId/file` (download/preview).
     - `POST /contents/adjustment-proposals/:proposalId/approve` (aprovar e trocar arquivo).
     - `POST /contents/adjustment-proposals/:proposalId/reject` (rejeitar).
   - Regras de permissão e validação (incluindo eventual regra de “autor não aprova a própria proposta”).

2. **Backend – Histórico de arquivos**:
   - Criar entidade `ContentFileHistory`.
   - Integrar `uploadFileDemand` e `approveAdjustmentProposal` para registrar novas versões e atualizar `lastEditedBy`/`lastEditedAt`.
   - Endpoints:
     - `GET /contents/:contentId/file-history`.
     - (Opcional) `GET /contents/:contentId/file-history/:historyId/file`.

3. **Backend – DTO de conteúdo**:
   - Incluir `lastEditedBy` e `lastEditedAt` no DTO retornado por `getContent`.

4. **Frontend – Serviços**:
   - Implementar funções em `src/services/content` para:
     - Propostas de ajuste (create/list/approve/reject/getFile).
     - Histórico de arquivos (listar e, opcionalmente, download de versões antigas).

5. **Frontend – UI em `ValidatedDemand`**:
   - Adicionar:
     - Botão “Proposta de Ajuste”.
     - Modal `AdjustmentProposalModal`.
     - Seção de listagem de propostas com ações de visualizar/baixar/aprovar/rejeitar.
     - Seção “Histórico de Arquivos” mostrando todas as versões.

6. **Frontend – Cards em `DashContent`**:
   - Ajustar `cardTransformationContent` para exibir `Última edição por ... em ...` usando os novos campos.

7. **Testes Manuais**:
   - Upload inicial de conteúdo e verificação de histórico (versão 1).
   - Criação de proposta de ajuste e aprovação:
     - Ver se o arquivo vigente muda.
     - Ver se histórico ganha nova versão.
     - Ver se `lastEditedBy`/`lastEditedAt` e o card refletem a nova edição.
   - Rejeição de proposta:
     - Garantir que arquivo vigente não muda.
     - Proposta aparece como rejeitada.
   - Verificação de permissões:
     - Usuários sem permissão não devem ver botões/ações indevidas.

