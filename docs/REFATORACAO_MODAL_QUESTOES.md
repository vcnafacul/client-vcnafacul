# Refatoração: Modal de Visualização/Edição de Questões

## 📑 Índice

1. [Sumário Executivo](#-sumário-executivo)
2. [Análise do Código Atual](#-análise-do-código-atual)
3. [Problemas Identificados](#️-problemas-identificados)
4. [Proposta de Refatoração](#-proposta-de-refatoração)
5. [Distribuição de Responsabilidades](#-distribuição-de-responsabilidades)
6. [Plano de Implementação](#-plano-de-implementação)
7. [💾 Proposta: Salvamento Granular por Tab](#-proposta-salvamento-granular-por-tab) ⭐ **NOVO**
8. [Benefícios Esperados](#-benefícios-esperados)
9. [Mockups da Interface](#-mockup-da-interface-proposta)
10. [Tecnologias](#-tecnologias-e-bibliotecas)
11. [Riscos e Mitigações](#️-riscos-e-mitigações)
12. [Integração com DashQuestion](#-integração-com-dashquestion)
13. [Considerações Importantes](#-considerações-importantes-para-implementação)
14. [Checklist Final](#-checklist-final)
15. [Métricas de Sucesso](#-métricas-de-sucesso)
16. [Próximos Passos](#-próximos-passos)

---

## 📋 Sumário Executivo

Este documento apresenta uma análise detalhada do componente `ModalDetalhes` (865 linhas) e propõe uma refatoração estrutural utilizando **4 abas (tabs)** para melhorar drasticamente a manutenibilidade, testabilidade e experiência do usuário.

### 🎯 Objetivo
Transformar um componente monolítico de 865 linhas em uma arquitetura modular com 4 tabs especializadas, aproveitando a infraestrutura já existente no projeto.

### ✅ Descobertas Importantes
- **ModalTabTemplate já existe** e está funcional
- **ModalHistorico já implementado** e testado
- Componente de tabs (Shadcn/Radix UI) já disponível
- Economia de ~3 dias de desenvolvimento

### 🎨 Proposta
**4 Tabs Especializadas:**
1. **Classificação** - Prova, número, área ENEM, disciplinas, frentes + revisões
2. **Conteúdo** - Texto da questão, 5 alternativas, resposta correta
3. **Imagens** - Upload, preview, conversão HEIC (preparado para múltiplas imagens)
4. **Histórico** - ✅ Já implementado, apenas integrar

### ⏱️ Estimativa
**10-12 dias úteis** (reduzido de 15 dias originais)  
**+5-7 dias** para salvamento granular (Fase 2 - opcional/futuro)

### 📊 Transformação Visual

```
ANTES (Estrutura Atual):
┌─────────────────────────────────┐
│  Modal com 2 Tabs               │
│  ┌───────────┐  ┌──────────┐   │
│  │ Detalhes  │  │Histórico │   │
│  └───────────┘  └──────────┘   │
│                                 │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │  ModalDetalhes.tsx       │ │
│  │  (865 linhas)            │ │
│  │  ┌─────────────────────┐ │ │
│  │  │ Tudo misturado:     │ │ │
│  │  │ - Classificação     │ │ │
│  │  │ - Conteúdo         │ │ │
│  │  │ - Imagens          │ │ │
│  │  │ - Validações       │ │ │
│  │  │ - Ações            │ │ │
│  │  └─────────────────────┘ │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘

DEPOIS (Estrutura Proposta):
┌──────────────────────────────────────────────────┐
│  Modal com 4 Tabs                                │
│  ┌──────┐┌──────┐┌──────┐┌──────────┐          │
│  │Class.││Cont. ││Imag. ││Histórico │          │
│  └──────┘└──────┘└──────┘└──────────┘          │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Tab 1: Classificação (< 200 linhas)     │   │
│  │ - Prova, número, área                   │   │
│  │ - Disciplinas e frentes                 │   │
│  │ - Revisões necessárias                  │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Tab 2: Conteúdo (< 200 linhas)          │   │
│  │ - Texto da questão                      │   │
│  │ - 5 Alternativas                        │   │
│  │ - Resposta correta                      │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Tab 3: Imagens (< 150 linhas)           │   │
│  │ - Upload e preview                      │   │
│  │ - Conversão HEIC                        │   │
│  │ - Preparado para múltiplas              │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Tab 4: Histórico ✅ (já existe)         │   │
│  │ - Quem cadastrou                        │   │
│  │ - Última edição                         │   │
│  │ - Timeline de mudanças                  │   │
│  └─────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘

RESULTADO: 
✅ Componentes menores e focados
✅ Fácil manutenção e testes
✅ Melhor UX (menos sobrecarga)
✅ Preparado para crescimento
```

---

## 🔍 Análise do Código Atual

### Estatísticas do Componente

- **Linhas de código:** 865 linhas
- **Estados locais:** 13 `useState`
- **Campos do formulário:** 21 campos
- **Modais auxiliares:** 4 modais
- **Funções internas:** ~15 funções
- **Watchers:** 12 watchers de formulário

### Complexidade Ciclomática

O componente atual possui alta complexidade ciclomática devido a:
- Múltiplas condicionais para controle de edição/visualização
- Lógica condicional para permissões
- Renderização condicional de botões e campos
- Gerenciamento de estados interdependentes

**Estimativa de Complexidade:** Alta (>25)

---

## ⚠️ Problemas Identificados

### 1. **Violação do Princípio de Responsabilidade Única (SRP)**

O componente gerencia simultaneamente:
- Classificação da questão (prova, número, área)
- Texto e alternativas
- Imagens
- Validações
- Estados de edição
- Modais de confirmação
- Lógica de API (upload, update, delete)

### 2. **Dificuldade de Manutenção**

- 865 linhas em um único arquivo
- Difícil localizar funcionalidades específicas
- Alto risco de introduzir bugs ao fazer alterações
- Código de difícil leitura e compreensão

### 3. **Testabilidade Comprometida**

- Difícil criar testes unitários isolados
- Muitas dependências e efeitos colaterais
- Estados interdependentes complexos

### 4. **Bugs Identificados**

```typescript
// Linhas 95-98: Todas as alternativas defaultam para textoAlternativaA
textoAlternativaB: yup.string().default(question?.textoAlternativaA),
textoAlternativaC: yup.string().default(question?.textoAlternativaA),
textoAlternativaD: yup.string().default(question?.textoAlternativaA),
textoAlternativaE: yup.string().default(question?.textoAlternativaA),
```

**Deveria ser:**
```typescript
textoAlternativaB: yup.string().default(question?.textoAlternativaB),
textoAlternativaC: yup.string().default(question?.textoAlternativaC),
textoAlternativaD: yup.string().default(question?.textoAlternativaD),
textoAlternativaE: yup.string().default(question?.textoAlternativaE),
```

### 5. **Acoplamento Alto**

- Lógica de negócio misturada com apresentação
- Dificuldade de reutilizar partes do código
- Dependências implícitas entre seções

### 6. **Experiência do Usuário**

- Interface sobrecarregada com muitas informações
- Scroll excessivo necessário
- Campos de diferentes contextos misturados

---

## 🎯 Proposta de Refatoração

### ✅ Estrutura Existente Aproveitada

O projeto já possui um `ModalTabTemplate` implementado e funcional em:
- `src/components/templates/modalTabTemplate/index.tsx`
- Já utilizado no `DashQuestion` para mostrar "Detalhes" e "Histórico"
- Componente `ModalHistorico` já implementado e testado

### Arquitetura Proposta: Modal com 4 Tabs

```
┌──────────────────────────────────────────────────────────────┐
│  Modal: Edição de Questão                            [X]     │
├──────────────────────────────────────────────────────────────┤
│  [Classificação] [Conteúdo] [Imagens] [Histórico]           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Conteúdo da Tab Selecionada                                │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  [Ações Comuns: Salvar, Cancelar, etc]                      │
└──────────────────────────────────────────────────────────────┘
```

### Estrutura de Componentes

```
dashQuestion/
├── index.tsx                          # ✅ Já existe - ajustar para usar novas tabs
├── modals/
│   ├── modalHistorico.tsx            # ✅ Já existe - manter como está
│   ├── modalDetalhes.tsx             # ⚠️  Deprecado - será substituído
│   └── modalDetalhesRefatorado/
│       ├── index.tsx                 # 🆕 Componente principal (substitui modalDetalhes)
│       ├── types.ts                  # 🆕 Tipos TypeScript compartilhados
│       ├── hooks/
│       │   ├── useQuestionForm.ts   # 🆕 Hook para gerenciar formulário
│       │   ├── useQuestionActions.ts # 🆕 Hook para ações (salvar, deletar)
│       │   └── useQuestionImage.ts  # 🆕 Hook para gerenciar imagens
│       ├── tabs/
│       │   ├── TabClassificacao/
│       │   │   ├── index.tsx        # 🆕 Tab de classificação
│       │   │   ├── FormClassificacao.tsx # 🆕 Formulário de classificação
│       │   │   ├── RevisoesNecessarias.tsx # 🆕 Checkboxes de revisão
│       │   │   └── schema.ts        # 🆕 Validação Yup
│       │   ├── TabConteudo/
│       │   │   ├── index.tsx        # 🆕 Tab de conteúdo
│       │   │   ├── TextoQuestao.tsx # 🆕 Texto da questão
│       │   │   ├── Alternativas.tsx # 🆕 Lista de alternativas
│       │   │   ├── SelecionarResposta.tsx # 🆕 Seleção de resposta
│       │   │   └── schema.ts        # 🆕 Validação Yup
│       │   └── TabImagens/
│       │       ├── index.tsx        # 🆕 Tab de imagens
│       │       ├── ImagemPrincipal.tsx # 🆕 Imagem da questão
│       │       ├── ImagensAlternativas.tsx # 🆕 (Futuro) Imagens por alternativa
│       │       └── ImageUploader.tsx # 🆕 Componente de upload
│       ├── components/
│       │   └── ActionsBar.tsx       # 🆕 Barra de ações (Aceitar, Rejeitar, etc)
│       └── modals/
│           ├── ModalRefused.tsx     # 🆕 Modal de rejeição
│           ├── ModalComeBack.tsx    # 🆕 Modal de confirmação de saída
│           └── ModalDeleteQuestion.tsx # 🆕 Modal de exclusão

Legenda:
✅ Já existe e será mantido
⚠️  Será deprecado/substituído
🆕 Será criado na refatoração
```

---

## 📊 Distribuição de Responsabilidades

### Tab 1: Classificação
**Responsabilidade:** Gerenciar metadados da questão

**Campos:**
- Prova (dropdown)
- Número da Questão (dropdown com números disponíveis)
- Área do Conhecimento ENEM (dropdown)
- Disciplina (dropdown)
- Frente Principal (dropdown)
- Frente Secundária (dropdown - opcional)
- Frente Terciária (dropdown - opcional)
- Link para visualizar prova

**Componentes Adicionais:**
- Revisões Necessárias (checkboxes):
  - Classificação de Prova
  - Classificação de Disciplina e Frente
  - Texto da Questão/alternativas
  - Imagem
  - Alternativa Correta
  - Report

**Validações:**
- Campos obrigatórios: prova, numero, enemArea
- Validação de dependências (materia depende de enemArea)

---

### Tab 2: Conteúdo
**Responsabilidade:** Gerenciar texto e alternativas

**Campos:**
- Texto da Questão (textarea)
- Pergunta (text input)
- Alternativa A (text input)
- Alternativa B (text input)
- Alternativa C (text input)
- Alternativa D (text input)
- Alternativa E (text input)
- Seleção da Resposta Correta (radio buttons)

**Validações:**
- Texto da questão obrigatório
- Pelo menos uma alternativa deve ser selecionada como correta

---

### Tab 3: Imagens
**Responsabilidade:** Gerenciar imagens da questão

**Recursos:**
- Upload de imagem principal
- Preview da imagem
- Visualização em modal (expandida)
- Download da imagem
- Conversão automática de HEIC para PNG

**Futuro:**
- Upload de imagem por alternativa (A, B, C, D, E)
- Galeria de imagens
- Ferramentas de edição básica (crop, rotate)

---

### Tab 4: Histórico
**Responsabilidade:** Exibir histórico de alterações da questão

**Status:** ✅ Já implementado em `modalHistorico.tsx`

**Recursos:**
- Informações de quem cadastrou a questão
- Data de cadastro
- Última edição (usuário, email, data)
- Histórico completo de alterações (changelog)
- Timeline de modificações

**Ação na Refatoração:**
- Manter componente existente sem alterações
- Apenas integrar como 4ª tab no novo modal

**Observação:** Esta tab é somente leitura, não requer validações ou ações de edição.

---

## 🚀 Plano de Implementação

### Fase 1: Preparação e Estrutura Base (2-3 dias)

#### 1.1 Criar Estrutura de Pastas
```bash
src/pages/dashQuestion/modals/ModalQuestaoRefatorado/
```

#### 1.2 Extrair Tipos e Interfaces
- Criar `types.ts` com todas as interfaces
- Migrar tipos do arquivo original
- Adicionar novos tipos para tabs

#### 1.3 Criar Hooks Personalizados

**`useQuestionForm.ts`**
```typescript
// Gerencia estado do formulário, validações e sincronização entre tabs
export const useQuestionForm = (question?: Question) => {
  // Estado do formulário
  // Validações
  // Sincronização
  return { form, isDirty, reset, ... }
}
```

**`useQuestionActions.ts`**
```typescript
// Gerencia ações de criar, atualizar, deletar, aprovar, rejeitar
export const useQuestionActions = (token: string) => {
  return { 
    createQuestion, 
    updateQuestion, 
    deleteQuestion,
    approveQuestion,
    rejectQuestion 
  }
}
```

**`useQuestionImage.ts`**
```typescript
// Gerencia upload, preview, conversão HEIC
export const useQuestionImage = () => {
  return { 
    imagePreview, 
    handleUpload, 
    convertHEIC, 
    ... 
  }
}
```

---

### Fase 2: Desenvolvimento das Tabs (4-5 dias)

#### 2.1 Tab Classificação (Dia 1)

**Tarefas:**
- [ ] Criar componente `TabClassificacao/index.tsx`
- [ ] Implementar `FormClassificacao.tsx`
- [ ] Migrar lógica de `listFieldClassification`
- [ ] Implementar `RevisoesNecessarias.tsx`
- [ ] Migrar checkboxes de revisão
- [ ] Criar schema de validação separado
- [ ] Adicionar link para download da prova
- [ ] Testar funcionalidade isoladamente

**Complexidade:** Média

---

#### 2.2 Tab Conteúdo (Dia 2-3)

**Tarefas:**
- [ ] Criar componente `TabConteudo/index.tsx`
- [ ] Implementar `TextoQuestao.tsx`
- [ ] Implementar `Alternativas.tsx` (5 inputs)
- [ ] Implementar `SelecionarResposta.tsx`
- [ ] Migrar lógica de `listFieldInfoQuestion`
- [ ] Criar schema de validação separado
- [ ] Adicionar validações de alternativa correta
- [ ] Testar funcionalidade isoladamente

**Complexidade:** Média-Alta

---

#### 2.3 Tab Imagens (Dia 4)

**Tarefas:**
- [ ] Criar componente `TabImagens/index.tsx`
- [ ] Implementar `ImagemPrincipal.tsx`
- [ ] Implementar `ImageUploader.tsx`
- [ ] Migrar lógica de upload e preview
- [ ] Migrar conversão HEIC para PNG
- [ ] Implementar visualização em modal
- [ ] Preparar estrutura para imagens por alternativa (futuro)
- [ ] Testar funcionalidade isoladamente

**Complexidade:** Média

---

### Fase 3: Componente Principal e Integração (2 dias)

#### 3.1 Integrar com ModalTabTemplate Existente

**Tarefas:**
- [ ] Criar componente principal `modalDetalhesRefatorado/index.tsx`
- [ ] Configurar 4 tabs no `ModalTabTemplate`:
  - Tab 1: Classificação (novo)
  - Tab 2: Conteúdo (novo)
  - Tab 3: Imagens (novo)
  - Tab 4: Histórico (✅ reutilizar `modalHistorico.tsx`)
- [ ] Implementar persistência de estado entre tabs
- [ ] Adicionar indicadores visuais de validação por tab (ícones de erro/sucesso)
- [ ] Garantir que dados do formulário sejam compartilhados entre as tabs

**Complexidade:** Média

---

#### 3.2 Barra de Ações

**Tarefas:**
- [ ] Criar `ActionsBar.tsx`
- [ ] Migrar botões de ação (Aceitar, Rejeitar, Editar, Salvar)
- [ ] Implementar lógica de permissões
- [ ] Adicionar estados disabled baseados em validações
- [ ] Implementar confirmações de ação

---

### Fase 4: Modais Auxiliares (1 dia)

#### 4.1 Refatorar Modais de Confirmação

**Tarefas:**
- [ ] Migrar `ModalRefused` para pasta de modals
- [ ] Migrar `ModalComeBack` para pasta de modals
- [ ] Migrar `ModalDeleteQuestion` para pasta de modals
- [ ] Melhorar reutilização de código

---

### Fase 5: Integração e Testes (2-3 dias)

#### 5.1 Integração Completa

**Tarefas:**
- [ ] Integrar todas as tabs no componente principal
- [ ] Conectar hooks com tabs
- [ ] Implementar fluxo completo de criação
- [ ] Implementar fluxo completo de edição
- [ ] Implementar fluxo completo de aprovação/rejeição
- [ ] Corrigir bugs identificados (defaults das alternativas)

---

#### 5.2 Testes

**Tarefas:**
- [ ] Testes unitários para hooks
- [ ] Testes de componente para cada tab
- [ ] Testes de integração do modal completo
- [ ] Testes de validação de formulário
- [ ] Testes de permissões
- [ ] Testes de upload de imagem

---

#### 5.3 Validação com Usuários

**Tarefas:**
- [ ] Testes em ambiente de desenvolvimento
- [ ] Coleta de feedback de UX
- [ ] Ajustes baseados em feedback
- [ ] Documentação de uso

---

### Fase 6: Substituição e Deploy (1-2 dias)

#### 6.1 Atualizar DashQuestion/index.tsx

**Tarefas:**
- [ ] Atualizar `ModalEdit` para usar 4 tabs:
  - Classificação (em vez de Detalhes)
  - Conteúdo
  - Imagens
  - Histórico (manter existente)
- [ ] Atualizar `ModalRegister` para usar 3 tabs:
  - Classificação
  - Conteúdo
  - Imagens
  - (Sem histórico no cadastro de nova questão)
- [ ] Trocar import de `ModalDetalhes` para `ModalDetalhesRefatorado`
- [ ] Testar fluxo completo de edição
- [ ] Testar fluxo completo de cadastro

---

#### 6.2 Backup e Transição

**Tarefas:**
- [ ] Renomear `modalDetalhes.tsx` para `modalDetalhes.OLD.tsx`
- [ ] Adicionar comentário de deprecação
- [ ] Manter arquivo por 1-2 sprints como fallback
- [ ] Verificar não haver regressões

---

#### 6.3 Deploy

**Tarefas:**
- [ ] Code review completo
- [ ] Deploy em ambiente de staging
- [ ] Testes de aceitação com usuários
- [ ] Validar performance
- [ ] Deploy em produção
- [ ] Monitoramento pós-deploy
- [ ] Documentar alterações no changelog

---

## 💾 Proposta: Salvamento Granular por Tab

### 📊 Análise da Proposta

#### Conceito
Ao invés de um único botão "Salvar" que atualiza todos os dados da questão, implementar:
1. **Salvamento por Tab** - Cada tab salva apenas suas alterações
2. **Salvamento em Lote** - Opção de salvar múltiplas tabs de uma vez
3. **APIs Especializadas** - Endpoints dedicados por seção da questão

### ✅ Vantagens

#### 1. Performance Otimizada
```
Antes (Salvamento Único):
- Envia TODOS os campos (21+ campos)
- Payload: ~5-10 KB
- Processa tudo no backend

Depois (Salvamento Granular):
- Envia apenas campos modificados
- Payload: ~1-2 KB por tab
- Processa apenas seção específica
```

#### 2. Melhor Experiência do Usuário
- ✅ Usuário pode salvar progresso parcial
- ✅ Não precisa preencher tudo de uma vez
- ✅ Feedback específico: "Classificação salva com sucesso"
- ✅ Menos frustração se perder conexão
- ✅ Trabalho incremental e seguro

#### 3. Validação Mais Inteligente
```typescript
// Validação apenas dos campos da tab ativa
Tab Classificação → valida: prova, numero, enemArea, materias, frentes
Tab Conteúdo → valida: textoQuestao, alternativas, resposta
Tab Imagens → valida: formato, tamanho de arquivo
```

#### 4. Menor Risco de Conflitos
- ✅ Múltiplos usuários podem editar seções diferentes
- ✅ Lock granular por seção (se implementado)
- ✅ Menos chance de sobrescrever alterações alheias

#### 5. Melhor Rastreabilidade
```typescript
// Histórico mais detalhado
"João alterou Classificação às 14:30"
"Maria alterou Conteúdo às 14:35"
"João alterou Imagens às 14:40"

vs.

"João alterou a questão às 14:30"
```

### ⚠️ Desafios e Considerações

#### 1. Dependências entre Tabs

**Problema:** Algumas mudanças afetam outras tabs

```typescript
// Exemplo: Mudar prova afeta número disponível
Tab 1: Altera prova de "ENEM 2023" → "ENEM 2024"
Impacto: Números disponíveis mudam
Solução: Revalidar Tab 1 ao trocar de prova
```

**Estratégia de Mitigação:**
```typescript
const dependencies = {
  prova: ['numero', 'enemArea'],
  enemArea: ['materia'],
  materia: ['frente1']
};

function handleFieldChange(field, value) {
  // Marcar dependências como "precisam revisão"
  if (dependencies[field]) {
    dependencies[field].forEach(dep => {
      markFieldForReview(dep);
    });
  }
}
```

#### 2. Validação Cruzada

**Problema:** Algumas validações dependem de múltiplas tabs

```typescript
// Exemplo de validação cruzada
if (!question.materia || !question.frente1) {
  question.subjectClassification = true; // Flag de revisão
}

if (!question.textoQuestao) {
  question.textClassification = true;
}
```

**Solução:**
```typescript
// Executar validação cruzada após salvar qualquer tab
async function afterSave(tabName) {
  const fullQuestion = await fetchCompleteQuestion(questionId);
  runCrossValidation(fullQuestion);
  updateRevisoesNecessarias(fullQuestion);
}
```

#### 3. UX - Quando Salvar?

**Desafios:**
- Usuário pode esquecer de salvar uma tab
- Confusão entre "Salvar Tab" vs "Salvar Tudo"
- Risco de dados parciais

**Soluções Propostas:**

**A) Indicadores Visuais Claros**
```typescript
// Tabs não salvas com indicador
┌────────────────────────────────────────┐
│ 📝 Classificação*  ✅ Conteúdo  📝 Imagens* │
│ (não salva)       (salva)     (não salva)  │
└────────────────────────────────────────┘
```

**B) Confirmação ao Trocar de Tab**
```typescript
function handleTabChange(newTab) {
  if (currentTabIsDirty && !currentTabSaved) {
    showConfirmation({
      title: "Alterações não salvas",
      message: "Deseja salvar as alterações da tab Classificação?",
      options: [
        "Salvar e Continuar",
        "Descartar",
        "Cancelar"
      ]
    });
  }
}
```

**C) Auto-save (Opcional)**
```typescript
// Salvar automaticamente após X segundos de inatividade
useDebounce(() => {
  if (tabIsDirty) {
    autoSaveTab(currentTab);
  }
}, 5000); // 5 segundos
```

**D) Botões Contextuais**
```
┌──────────────────────────────────────────┐
│ Tab: Classificação                       │
│ [Salvar Classificação] [Salvar Tudo (2)]│
└──────────────────────────────────────────┘

Quando 2+ tabs modificadas:
[Salvar Atual] [Salvar Todas (3)] [Descartar Tudo]
```

#### 4. Estrutura de API

**Opção A: Endpoints Separados (Recomendado)**
```typescript
// Melhor separação de responsabilidades
PATCH /api/questions/:id/classification
PATCH /api/questions/:id/content
PATCH /api/questions/:id/images

// Backend pode ter handlers específicos
class QuestionController {
  updateClassification(id, data) { ... }
  updateContent(id, data) { ... }
  updateImages(id, data) { ... }
}
```

**Opção B: Endpoint Único com Seções**
```typescript
PATCH /api/questions/:id

// Body indica qual seção atualizar
{
  section: 'classification',
  data: {
    prova: '...',
    numero: 42,
    ...
  }
}

// Backend roteia internamente
function updateQuestion(id, section, data) {
  switch(section) {
    case 'classification': 
      return updateClassification(id, data);
    case 'content':
      return updateContent(id, data);
    ...
  }
}
```

**Opção C: Endpoint Único com Partial Update (Atual)**
```typescript
PATCH /api/questions/:id

// Envia apenas campos modificados
{
  prova: '...',
  numero: 42
  // Outros campos omitidos
}

// Backend faz merge
```

**Recomendação:** Opção A (endpoints separados) por:
- ✅ Melhor separação de concerns
- ✅ Permissões granulares (ex: alguns usuários só editam imagens)
- ✅ Mais fácil de escalar e manter
- ✅ Logs e métricas mais precisos

#### 5. Controle de Concorrência

**Cenário:** Dois usuários editando a mesma questão

```typescript
// Estratégia 1: Optimistic Locking
interface Question {
  _id: string;
  version: number; // Incrementa a cada save
  // ...
}

async function saveTab(tab, data) {
  const response = await api.patch(`/questions/${id}/${tab}`, {
    data,
    version: currentVersion
  });
  
  if (response.status === 409) {
    // Conflito: alguém salvou antes
    showConflictResolution();
  }
}

// Estratégia 2: Last-Write-Wins (Simples)
// Última alteração sempre ganha
// Avisar usuário que dados podem ser sobrescritos
```

### 🎨 Mockups da Interface com Salvamento Granular

```
┌─────────────────────────────────────────────────────────┐
│ Questão #12345                                    [X]   │
├─────────────────────────────────────────────────────────┤
│ 📝 Classificação*  ✅ Conteúdo  📝 Imagens*  ✅ Histórico│
│ ───────────────                                          │
│                                                          │
│ ┌────────── Tab Classificação ──────────┐              │
│ │ Prova: [ENEM 2023 ▼]     [modificado] │              │
│ │ Número: [42 ▼]                         │              │
│ │ ...                                     │              │
│ └────────────────────────────────────────┘              │
│                                                          │
│ ⚠️ 2 tabs com alterações não salvas                     │
│                                                          │
│ ┌───────────────────────────────────────┐              │
│ │ Ações:                                │              │
│ │ [Salvar Classificação] [Salvar Tudo (2)]            │
│ │ [Descartar] [Cancelar]                │              │
│ └───────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘

Fluxo de Salvamento:
1. Usuário edita Tab 1 → Marca 📝
2. Usuário edita Tab 3 → Marca 📝
3. Botão aparece: "Salvar Tudo (2)"
4. Opções:
   - Salvar apenas tab atual
   - Salvar todas as modificadas
   - Descartar tudo
```

### 🛠️ Implementação Técnica

#### Hooks Personalizados

```typescript
// Hook para gerenciar salvamento granular
export function useGranularSave(questionId: string) {
  const [dirtyTabs, setDirtyTabs] = useState<TabDirtyState>({
    classificacao: false,
    conteudo: false,
    imagens: false,
  });
  
  const [savingTabs, setSavingTabs] = useState<Set<string>>(new Set());
  
  // Salvar tab específica
  async function saveTab(tabName: TabName, data: any) {
    setSavingTabs(prev => new Set([...prev, tabName]));
    
    try {
      await api.patch(`/questions/${questionId}/${tabName}`, data);
      
      setDirtyTabs(prev => ({ ...prev, [tabName]: false }));
      toast.success(`${tabName} salva com sucesso`);
      
    } catch (error) {
      toast.error(`Erro ao salvar ${tabName}`);
      throw error;
      
    } finally {
      setSavingTabs(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabName);
        return newSet;
      });
    }
  }
  
  // Salvar todas as tabs modificadas
  async function saveAll() {
    const tabsToSave = Object.entries(dirtyTabs)
      .filter(([_, isDirty]) => isDirty)
      .map(([tab]) => tab);
    
    const results = await Promise.allSettled(
      tabsToSave.map(tab => saveTab(tab as TabName, getTabData(tab)))
    );
    
    const failed = results.filter(r => r.status === 'rejected');
    
    if (failed.length === 0) {
      toast.success('Todas as alterações salvas!');
    } else {
      toast.error(`${failed.length} tab(s) falharam ao salvar`);
    }
  }
  
  // Marcar tab como modificada
  function markTabDirty(tabName: TabName) {
    setDirtyTabs(prev => ({ ...prev, [tabName]: true }));
  }
  
  const dirtyCount = Object.values(dirtyTabs).filter(Boolean).length;
  
  return {
    dirtyTabs,
    dirtyCount,
    savingTabs,
    saveTab,
    saveAll,
    markTabDirty,
  };
}
```

#### Componente de Botões de Salvamento

```typescript
export function SaveActions({ 
  currentTab, 
  dirtyTabs, 
  dirtyCount,
  onSaveTab,
  onSaveAll 
}: SaveActionsProps) {
  const isCurrentTabDirty = dirtyTabs[currentTab];
  
  if (dirtyCount === 0) {
    return null; // Nada para salvar
  }
  
  return (
    <div className="flex gap-2 p-4 border-t">
      {isCurrentTabDirty && (
        <Button 
          onClick={() => onSaveTab(currentTab)}
          variant="primary"
        >
          Salvar {currentTab}
        </Button>
      )}
      
      {dirtyCount > 1 && (
        <Button 
          onClick={onSaveAll}
          variant="success"
        >
          Salvar Tudo ({dirtyCount})
        </Button>
      )}
      
      <Button variant="ghost">
        Descartar
      </Button>
    </div>
  );
}
```

### 📋 Checklist de Implementação

**Backend (se necessário criar novos endpoints):**
- [ ] Criar endpoint PATCH `/questions/:id/classification`
- [ ] Criar endpoint PATCH `/questions/:id/content`
- [ ] Criar endpoint PATCH `/questions/:id/images`
- [ ] Implementar validação por seção
- [ ] Implementar versionamento (optimistic locking)
- [ ] Adicionar logs específicos por seção
- [ ] Testes de API por endpoint

**Frontend:**
- [ ] Criar hook `useGranularSave`
- [ ] Implementar controle de dirty state por tab
- [ ] Criar componente `SaveActions`
- [ ] Adicionar indicadores visuais nas tabs
- [ ] Implementar confirmação ao trocar tabs
- [ ] Auto-save (opcional)
- [ ] Tratamento de conflitos de concorrência
- [ ] Validação cruzada entre tabs
- [ ] Testes unitários dos hooks
- [ ] Testes E2E do fluxo de salvamento

### 🎯 Recomendação Final

**✅ APROVADA COM RESSALVAS**

A proposta de salvamento granular é **excelente** e alinha-se bem com a refatoração em tabs. No entanto:

**Implementar em 2 Fases:**

**Fase 1 (MVP da Refatoração):**
- Manter salvamento único (como está hoje)
- Implementar apenas a estrutura de tabs
- Focar em modularizar o código
- Tempo: 10-12 dias conforme planejado

**Fase 2 (Salvamento Granular):**
- Após MVP estável, adicionar salvamento granular
- Criar novos endpoints de API
- Implementar controle de dirty state por tab
- Adicionar indicadores visuais
- Tempo adicional: +5-7 dias

**Justificativa:**
- ✅ Reduz complexidade inicial
- ✅ Permite validar arquitetura de tabs primeiro
- ✅ MVP mais rápido para feedback de usuários
- ✅ Salvamento granular como melhoria iterativa
- ✅ Menos risco na primeira release

**Se backend já suporta partial updates:**
- Pode implementar tudo junto
- Tempo total: +3-4 dias (total: 13-16 dias)

---

## 📈 Benefícios Esperados

### 1. **Manutenibilidade**
- ✅ Redução de ~60% no tamanho dos arquivos individuais
- ✅ Componentes com responsabilidades únicas
- ✅ Facilidade para adicionar novas funcionalidades
- ✅ Código mais legível e organizado

### 2. **Testabilidade**
- ✅ Testes unitários por componente
- ✅ Mocks mais simples
- ✅ Cobertura de testes aumentada
- ✅ Debugging mais fácil

### 3. **Experiência do Usuário**
- ✅ Interface mais organizada e limpa
- ✅ Foco em uma tarefa por vez
- ✅ Redução de sobrecarga cognitiva
- ✅ Navegação intuitiva

### 4. **Escalabilidade**
- ✅ Preparado para imagens por alternativa
- ✅ Fácil adicionar novas tabs
- ✅ Reutilização de componentes
- ✅ Arquitetura extensível

### 5. **Performance**
- ✅ Renderização condicional por tab
- ✅ Lazy loading de componentes
- ✅ Menos re-renders desnecessários

---

## 🎨 Mockup da Interface Proposta

### Visão Geral - Tab Classificação
```
┌────────────────────────────────────────────────────────────────────┐
│  Edição de Questão #12345                                   [X]    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │Classificação │ │   Conteúdo   │ │   Imagens    │ │Histórico││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
│  ────────────────                                                 │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TAB: CLASSIFICAÇÃO                                      │   │
│  │                                                           │   │
│  │  Prova: [ENEM 2023                            ▼]        │   │
│  │  Número: [42                                  ▼]        │   │
│  │  Área ENEM: [Ciências da Natureza            ▼]        │   │
│  │  Disciplina: [Física                          ▼]        │   │
│  │  Frente Principal: [Mecânica                 ▼]        │   │
│  │  Frente Secundária: [                         ▼]        │   │
│  │  Frente Terciária: [                          ▼]        │   │
│  │                                                           │   │
│  │  [🔗 Visualizar Prova]                                   │   │
│  │                                                           │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │ Revisões Necessárias                              │ │   │
│  │  │ ☐ Classificação de Prova                         │ │   │
│  │  │ ☐ Classificação de Disciplina e Frente          │ │   │
│  │  │ ☐ Texto da Questão/alternativas                 │ │   │
│  │  │ ☐ Imagem                                         │ │   │
│  │  │ ☐ Alternativa Correta                           │ │   │
│  │  │ ☐ Report                                         │ │   │
│  │  └───────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  [Aceitar] [Rejeitar] [Editar] [Deletar]  [Salvar] [Cancelar]   │
└────────────────────────────────────────────────────────────────────┘
```

### Tab Conteúdo
```
┌────────────────────────────────────────────────────────────────────┐
│  Edição de Questão #12345                                   [X]    │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │Classificação │ │   Conteúdo   │ │   Imagens    │ │Histórico││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
│                    ────────────────                                │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TAB: CONTEÚDO                                           │   │
│  │                                                           │   │
│  │  Texto da Questão:*                                      │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                                                  │    │   │
│  │  │  [Área de texto para o enunciado da questão]   │    │   │
│  │  │                                                  │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                           │   │
│  │  Pergunta:*                                              │   │
│  │  [_____________________________________________]         │   │
│  │                                                           │   │
│  │  Alternativa A: [_______________________________]       │   │
│  │  Alternativa B: [_______________________________]       │   │
│  │  Alternativa C: [_______________________________]       │   │
│  │  Alternativa D: [_______________________________]       │   │
│  │  Alternativa E: [_______________________________]       │   │
│  │                                                           │   │
│  │  Resposta Correta:*  [A] [B] [C] [D] [E]               │   │
│  │                       ▲                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Tab Imagens
```
┌────────────────────────────────────────────────────────────────────┐
│  Edição de Questão #12345                                   [X]    │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │Classificação │ │   Conteúdo   │ │   Imagens    │ │Histórico││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
│                                      ────────────────              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TAB: IMAGENS                                            │   │
│  │                                                           │   │
│  │  Imagem Principal da Questão:                            │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                                                  │    │   │
│  │  │            [Preview da Imagem]                  │    │   │
│  │  │              [🔍 Clique para ampliar]            │    │   │
│  │  │                                                  │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                           │   │
│  │  [📁 Upload Nova Imagem]  [🗑️ Remover]                  │   │
│  │                                                           │   │
│  │  ℹ️ Formatos aceitos: PNG, JPG, HEIC                    │   │
│  │  ℹ️ Conversão automática HEIC → PNG                     │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ 🔮 Futuro: Imagens por Alternativa              │    │   │
│  │  │                                                  │    │   │
│  │  │ [Imagem A] [Imagem B] [Imagem C]                │    │   │
│  │  │ [Imagem D] [Imagem E]                           │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Tab Histórico
```
┌────────────────────────────────────────────────────────────────────┐
│  Edição de Questão #12345                                   [X]    │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │Classificação │ │   Conteúdo   │ │   Imagens    │ │Histórico││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
│                                                        ───────────  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TAB: HISTÓRICO (✅ Já implementado)                     │   │
│  │                                                           │   │
│  │  📋 Cadastrado por:                                      │   │
│  │  Nome: Maria Silva                                       │   │
│  │  Email: maria@vcnafacul.com.br                          │   │
│  │  Data: 15/10/2025                                        │   │
│  │                                                           │   │
│  │  ✏️ Última Edição por:                                   │   │
│  │  Nome: João Santos                                       │   │
│  │  Email: joao@vcnafacul.com.br                           │   │
│  │  Data: 28/10/2025                                        │   │
│  │                                                           │   │
│  │  📜 Histórico de Alterações:                             │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ 28/10/2025 - João alterou: materia → Física   │    │   │
│  │  ├─────────────────────────────────────────────────┤    │   │
│  │  │ 20/10/2025 - Maria alterou: status → Aprovado │    │   │
│  │  ├─────────────────────────────────────────────────┤    │   │
│  │  │ 15/10/2025 - Maria criou a questão            │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tecnologias e Bibliotecas

### ✅ Já Utilizadas no Projeto
- **React Hook Form** - gerenciamento de formulário
- **Yup** - validação de schemas
- **heic2any** - conversão de imagem HEIC para PNG
- **ModalTabTemplate** - componente de modal com tabs já implementado
- **@/components/ui/tabs** - componente de tabs (provavelmente Shadcn/UI ou Radix)

### 🚫 NÃO Adicionar
- ~~@headlessui/react~~ - Já existe implementação de tabs
- ~~react-tabs~~ - Desnecessário

### 💡 Recomendadas (Opcional)
- **react-query** ou **SWR** - Para melhorar cache e gerenciamento de estado do servidor (futuro)
- **zustand** - Estado global leve se necessário (futuro)

---

## ⚠️ Riscos e Mitigações

### Risco 1: Regressão de Funcionalidades
**Mitigação:** 
- Testes extensivos antes de substituir
- Manter componente antigo como fallback inicial
- Deploy gradual (feature flag)

### Risco 2: Complexidade de Sincronização entre Tabs
**Mitigação:**
- Usar React Hook Form com contexto compartilhado
- Estado global para dados do formulário
- Testes de integração robustos

### Risco 3: Tempo de Desenvolvimento
**Mitigação:**
- Implementação por fases
- Revisões de código frequentes
- Pair programming para partes críticas

### Risco 4: Adoção por Usuários
**Mitigação:**
- Testes com usuários antes do deploy
- Treinamento/documentação
- Período de transição com ambas versões disponíveis

---

## 🔄 Integração com DashQuestion

### Estrutura Atual (Antes)

```typescript
// dashQuestion/index.tsx - ANTES
const ModalEdit = () => {
  return (
    <ModalTabTemplate
      tabs={[
        { label: "Detalhes", children: <ModalDetalhes ... /> },
        { label: "Historico", children: <ModalHistorico ... /> },
      ]}
    />
  );
};
```

### Estrutura Nova (Depois)

```typescript
// dashQuestion/index.tsx - DEPOIS
import ModalDetalhesRefatorado from './modals/modalDetalhesRefatorado';

const ModalEdit = () => {
  return (
    <ModalTabTemplate
      tabs={[
        { 
          label: "Classificação", 
          id: "classificacao",
          children: <TabClassificacao question={questionSelect} ... /> 
        },
        { 
          label: "Conteúdo", 
          id: "conteudo",
          children: <TabConteudo question={questionSelect} ... /> 
        },
        { 
          label: "Imagens", 
          id: "imagens",
          children: <TabImagens question={questionSelect} ... /> 
        },
        { 
          label: "Histórico", 
          id: "historico",
          children: <ModalHistorico id={questionSelect?._id ?? ""} /> 
        },
      ]}
    />
  );
};

const ModalRegister = () => {
  return (
    <ModalTabTemplate
      tabs={[
        { label: "Classificação", children: <TabClassificacao ... /> },
        { label: "Conteúdo", children: <TabConteudo ... /> },
        { label: "Imagens", children: <TabImagens ... /> },
        // Sem histórico - questão ainda não existe
      ]}
    />
  );
};
```

### Compartilhamento de Estado entre Tabs

```typescript
// modalDetalhesRefatorado/index.tsx
export function ModalDetalhesRefatorado({ question, infos, ... }) {
  // Hook compartilhado entre todas as tabs
  const { form, isDirty, handleSave } = useQuestionForm(question);
  const { uploadImage, imagePreview } = useQuestionImage();
  
  return {
    TabClassificacao: <TabClassificacao form={form} infos={infos} />,
    TabConteudo: <TabConteudo form={form} />,
    TabImagens: <TabImagens form={form} imagePreview={imagePreview} uploadImage={uploadImage} />,
  };
}
```

---

## ⚡ Considerações Importantes para Implementação

### 1. Compartilhamento de Estado do Formulário

**Desafio:** Todas as tabs precisam acessar o mesmo formulário React Hook Form.

**Solução:**
```typescript
// Usar um Provider ou passar o form como prop
const FormProvider = ({ children, question }) => {
  const form = useForm({ ... });
  
  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  );
};
```

### 2. Validação por Tab

Adicionar indicadores visuais nas tabs para mostrar erros:

```typescript
const tabs = [
  { 
    label: hasErrors.classificacao ? "⚠️ Classificação" : "✅ Classificação",
    // ...
  }
];
```

### 3. Navegação entre Tabs

Implementar navegação automática:
- Ao salvar com erros, ir para primeira tab com erro
- Ao preencher campos obrigatórios, sugerir próxima tab

### 4. Performance

- Lazy loading das tabs (carregar conteúdo só quando acessada)
- Memoização de componentes pesados
- Otimizar re-renders com React.memo

### 5. Modo Edição vs Visualização

Todas as tabs devem respeitar o estado `isEditing`:
```typescript
<Input disabled={!isEditing} ... />
```

### 6. Salvamento Granular por Tab ⭐ NOVA PROPOSTA

**Conceito:** Cada tab pode ser salva independentemente, otimizando performance e UX.

#### 6.1 Botões de Salvamento

**Por Tab (Individual):**
```typescript
// Cada tab tem seu próprio botão "Salvar"
<Button onClick={handleSaveClassificacao}>
  Salvar Classificação
</Button>
```

**Salvamento em Lote:**
```typescript
// Quando múltiplas tabs têm alterações não salvas
<Button onClick={handleSaveAll}>
  Salvar Tudo (3) {/* Número de tabs modificadas */}
</Button>

// Alternativa: botões separados
<Button>Salvar Tab Atual</Button>
<Button>Salvar Todas ({dirtyTabsCount})</Button>
```

#### 6.2 APIs Especializadas

Cada tab chama seu próprio endpoint:

```typescript
// API por seção
PATCH /api/questions/:id/classification  // Tab 1
PATCH /api/questions/:id/content         // Tab 2  
PATCH /api/questions/:id/images          // Tab 3
// Tab 4 (Histórico) - somente leitura

// Ou endpoint único com partial update
PATCH /api/questions/:id
Body: { 
  section: 'classification',
  data: { prova, numero, enemArea, ... }
}
```

#### 6.3 Controle de Estado

```typescript
interface TabDirtyState {
  classificacao: boolean;
  conteudo: boolean;
  imagens: boolean;
}

const [dirtyTabs, setDirtyTabs] = useState<TabDirtyState>({
  classificacao: false,
  conteudo: false,
  imagens: false,
});
```

#### 6.4 Indicadores Visuais

```typescript
// Tabs com alterações não salvas
const tabs = [
  { 
    label: dirtyTabs.classificacao 
      ? "📝 Classificação*" 
      : "✅ Classificação",
    // ...
  }
];
```

### 7. Ações Globais

Botões de ação (Aceitar, Rejeitar) devem estar sempre visíveis:
- Fixar no topo ou rodapé do modal
- Disponíveis em todas as tabs
- Estado disabled baseado em validações
- **Novo:** Botões de salvamento inteligentes por contexto

---

## 📝 Checklist Final

### Antes de Iniciar
- [ ] Criar branch de desenvolvimento
- [ ] Configurar ambiente de teste
- [ ] Definir estratégia de testes
- [ ] Alinhar com equipe sobre design

### Durante Desenvolvimento
- [ ] Commits pequenos e frequentes
- [ ] Code review a cada fase
- [ ] Documentar decisões importantes
- [ ] Manter testes atualizados

### Antes do Deploy
- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Performance validada
- [ ] Acessibilidade verificada

---

## 🎯 Métricas de Sucesso

### Fase 1: Refatoração em Tabs

| Métrica | Antes | Meta Após Refatoração |
|---------|-------|----------------------|
| Linhas por arquivo | 865 | < 200 |
| Complexidade ciclomática | > 25 | < 10 |
| Cobertura de testes | ~20% | > 80% |
| Tempo de manutenção | 4h | < 1h |
| Bugs reportados | 3/mês | < 1/mês |
| Satisfação do usuário | 6/10 | > 8/10 |

### Fase 2: Salvamento Granular (se implementado)

| Métrica | Antes | Meta com Salvamento Granular |
|---------|-------|------------------------------|
| Tempo de salvamento | ~800ms | < 300ms (por tab) |
| Tamanho do payload | ~8 KB | ~2 KB (por tab) |
| Taxa de perda de dados | ~5% | < 1% |
| Conflitos de concorrência | ~10/mês | < 2/mês |
| Salvamentos parciais | 0 | > 50% dos salvamentos |
| Satisfação do usuário | 8/10 | > 9/10 |
| Tempo para salvar progresso | N/A | < 5 segundos |

---

## 📚 Referências

- [React Hook Form - Best Practices](https://react-hook-form.com/advanced-usage)
- [Component Design Patterns](https://www.patterns.dev/posts/react-component-patterns/)
- [Headless UI - Tabs](https://headlessui.com/react/tabs)
- [Clean Code Principles](https://clean-code-developer.com/)

---

## 👥 Equipe

**Responsáveis:**
- Desenvolvimento: [A definir]
- Code Review: [A definir]
- Testes: [A definir]
- UX/UI: [A definir]

**Estimativa Total:** 10-12 dias úteis

**Redução de tempo devido a:**
- ✅ ModalTabTemplate já implementado (-1 dia)
- ✅ ModalHistorico já implementado (-1 dia)
- ✅ Componente de tabs já funcional (-1 dia)

---

## 📅 Timeline Sugerido

### Fase 1: Refatoração em Tabs (10-12 dias)

```
Semana 1 (5 dias): 
  - Preparação e estrutura (1 dia)
  - Tab Classificação (1,5 dias)
  - Tab Conteúdo (2,5 dias)

Semana 2 (5 dias):
  - Tab Imagens (2 dias)
  - Integração com ModalTabTemplate (1 dia)
  - Modais auxiliares (1 dia)
  - Testes iniciais (1 dia)

Semana 3 (2 dias):
  - Testes completos e ajustes (1 dia)
  - Deploy e monitoramento (1 dia)
```

### Fase 2: Salvamento Granular (5-7 dias - OPCIONAL)

```
Semana 4 (3 dias):
  - Criar endpoints de API especializados (1 dia - backend)
  - Implementar hook useGranularSave (1 dia)
  - Implementar controle de dirty state por tab (1 dia)

Semana 5 (2-3 dias):
  - Adicionar indicadores visuais nas tabs (1 dia)
  - Implementar confirmação ao trocar tabs (0,5 dia)
  - Tratamento de validação cruzada (0,5 dia)
  - Testes e ajustes finais (1 dia)

Semana 6 (opcional - 1 dia):
  - Implementar auto-save (opcional)
  - Optimistic locking para concorrência
```

### Timeline Completo (Ambas Fases)

```
┌─────────────────────────────────────────────────┐
│ Refatoração Completa: 15-19 dias úteis         │
├─────────────────────────────────────────────────┤
│ Fase 1: Tabs                   │███████████│    │
│ (10-12 dias)                   └──────────┘    │
│                                                 │
│ Fase 2: Salvamento Granular    │█████│         │
│ (5-7 dias - OPCIONAL)          └────┘          │
└─────────────────────────────────────────────────┘
        0        5        10       15       20
                      Dias
```

---

## 🎯 Próximos Passos

### Imediatos
1. ✅ Revisar e aprovar esta proposta
2. ⏳ Criar issue/card no sistema de gerenciamento de projeto
3. ⏳ Definir sprint para início da implementação
4. ⏳ Alocar desenvolvedor(es) responsável(is)

### Antes de Começar
- [ ] Criar branch `refactor/modal-questoes-tabs`
- [ ] Setup de ambiente de desenvolvimento
- [ ] Familiarização com ModalTabTemplate existente
- [ ] Análise detalhada do código atual de ModalDetalhes

---

**Última Atualização:** 30/10/2025  
**Autor:** Assistente IA  
**Status:** 📋 Proposta Completa - Aguardando Aprovação  
**Próximo Passo:** Revisão e aprovação da proposta  
**Versão:** 2.0 (atualizada com estrutura existente)

