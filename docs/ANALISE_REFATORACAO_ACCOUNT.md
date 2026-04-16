# Análise de Refatoração - Página de Conta (Account)

## 📋 Problemas Identificados no Componente Atual

### 1. **Separação de Responsabilidades**
- ❌ Lógica de upload de imagem misturada com lógica de formulário
- ❌ Gerenciamento de estado complexo e espalhado
- ❌ Cleanup de blob URLs duplicado em múltiplos lugares
- ❌ Lógica de negócio diretamente no componente de apresentação

### 2. **Duplicação de Código**
- ❌ Nome do usuário renderizado duas vezes (mobile e desktop)
- ❌ Lógica de comparação de mudanças duplicada entre `Account` e `AccountForm`
- ❌ Validação de tamanho de arquivo poderia ser extraída

### 3. **Gerenciamento de Estado**
- ❌ Múltiplos estados relacionados (`imagePreview`, `file`, `hasImageChange`)
- ❌ Estado `userAccount` sincronizado manualmente com store
- ❌ Falta de estado de loading unificado

### 4. **Performance e Memória**
- ⚠️ Cleanup de blob URLs no `useEffect` pode não capturar todos os casos
- ⚠️ Re-renderizações desnecessárias por falta de memoização

### 5. **Manutenibilidade**
- ❌ Funções muito grandes (`update`, `deleteImage`)
- ❌ Tipos `any` em vários lugares
- ❌ Lógica de negócio difícil de testar isoladamente

---

## 🎯 Proposta de Refatoração

### Estrutura Proposta

```
src/pages/account/
├── index.tsx                    # Componente principal (orquestração)
├── components/
│   ├── AccountHeader.tsx        # Cabeçalho com foto e nome
│   ├── AccountFormSection.tsx   # Seção do formulário
│   └── CollaboratorFrentes.tsx # Nova feature: seleção de frentes
├── hooks/
│   ├── useAccountData.ts       # Hook para gerenciar dados do usuário
│   ├── useImageUpload.ts       # Hook para upload de imagem
│   └── useFrentesSelection.ts  # Hook para seleção de frentes
└── utils/
    └── accountHelpers.ts       # Funções auxiliares
```

### Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada componente/hook tem uma responsabilidade única
2. **Reutilização**: Hooks podem ser reutilizados em outros contextos
3. **Testabilidade**: Lógica isolada é mais fácil de testar
4. **Manutenibilidade**: Código mais organizado e fácil de entender
5. **Performance**: Melhor controle de re-renderizações com hooks otimizados

---

## 🆕 Análise de Complexidade - Feature de Seleção de Frentes

### Requisitos da Feature

1. **Input com lista de frentes** disponíveis
2. **Seleção de frentes** que remove da lista e mostra como label
3. **Remoção de frentes** selecionadas (volta para a lista)
4. **Persistência** das frentes selecionadas
5. **Edição** a qualquer momento

### Complexidade: **MÉDIA** ⚠️

#### Fatores de Complexidade

**✅ Baixa Complexidade:**
- UI simples (input + labels)
- Lógica de seleção/remoção direta
- Componente isolado

**⚠️ Média Complexidade:**
- **Busca de frentes**: Precisa buscar frentes de múltiplas matérias ou todas?
- **Filtragem**: Filtrar frentes já selecionadas da lista
- **Agrupamento**: Agrupar por matéria ou mostrar todas juntas?
- **Validação**: Limite de frentes? Validações de negócio?

**🔴 Alta Complexidade (Potencial):**
- **Performance**: Se houver muitas frentes (100+), pode precisar de virtualização
- **Busca/Filter**: Se a lista for grande, precisa de busca/filtro
- **API**: Estrutura da API para salvar frentes do colaborador
- **Sincronização**: Sincronizar com backend pode ter edge cases

### Decisões de Design Necessárias

1. **Fonte de dados das frentes:**
   - Buscar todas as frentes de todas as matérias?
   - Ou apenas frentes de matérias específicas?
   - Precisa de paginação?

2. **Interface do usuário:**
   - Input tipo select/autocomplete?
   - Ou input com dropdown customizado?
   - Como mostrar a matéria da frente?

3. **Limites e validações:**
   - Quantas frentes um colaborador pode selecionar?
   - Precisa de ordem/prioridade?

4. **Estrutura de dados:**
   - Salvar apenas IDs das frentes?
   - Ou objeto completo?
   - Onde salvar no backend? (novo campo em UserMe? Nova tabela?)

### Estimativa de Implementação

- **Componente UI**: 2-3 horas
- **Hook de gerenciamento**: 1-2 horas
- **Integração com formulário**: 1 hora
- **Mock da API**: 1 hora
- **Testes e ajustes**: 2 horas

**Total estimado**: 7-9 horas

---

## 📐 Proposta de Implementação

### Fase 1: Refatoração do Componente Atual (Recomendado antes da nova feature)

1. Extrair hooks customizados
2. Separar componentes
3. Melhorar tipagem
4. Adicionar testes básicos

### Fase 2: Implementação da Feature de Frentes

1. Criar componente `CollaboratorFrentes`
2. Criar hook `useFrentesSelection`
3. Integrar com formulário existente
4. Criar mock da API
5. Testar fluxo completo

### Estrutura de Dados Proposta

```typescript
// Adicionar ao UserMe
export type UserMe = Auth & {
  // ... campos existentes
  collaboratorFrentes?: string[]; // IDs das frentes selecionadas
};

// Ou criar interface separada
export interface CollaboratorFrentes {
  userId: string;
  frentesIds: string[];
}
```

---

## 🎨 Mock da API (Para desenvolvimento)

```typescript
// services/auth/updateCollaboratorFrentes.ts (mock)
export async function updateCollaboratorFrentes(
  frentesIds: string[],
  token: string
): Promise<void> {
  // Mock: simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock: salvar em localStorage para desenvolvimento
  localStorage.setItem('collaborator_frentes', JSON.stringify(frentesIds));
  
  return Promise.resolve();
}

// services/auth/getCollaboratorFrentes.ts (mock)
export async function getCollaboratorFrentes(
  token: string
): Promise<string[]> {
  // Mock: buscar do localStorage
  const stored = localStorage.getItem('collaborator_frentes');
  return stored ? JSON.parse(stored) : [];
}
```

---

## ✅ Próximos Passos

1. **Decidir estrutura de dados** para frentes no backend
2. **Definir UI/UX** da seleção de frentes
3. **Implementar refatoração** (opcional, mas recomendado)
4. **Implementar feature** com mocks
5. **Integrar com API real** quando disponível

---

## 📝 Notas Adicionais

- A feature de frentes pode ser implementada sem refatoração completa, mas a refatoração facilitaria muito a manutenção futura
- Considerar usar uma biblioteca de autocomplete/select se a lista de frentes for muito grande
- A feature pode ser expandida no futuro para incluir ordenação, prioridades, etc.

