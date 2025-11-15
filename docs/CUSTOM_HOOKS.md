# 🎣 Hooks Customizados - VcNaFacul

Documentação de hooks customizados implementados e oportunidades futuras de refatoração.

---

## 📚 Índice

- [Hooks Implementados](#hooks-implementados)
- [Hooks Pendentes](#hooks-pendentes)
- [Análise de Padrões](#análise-de-padrões)

---

## ✅ Hooks Implementados

### 1. `useToastAsync`

**Localização:** `src/hooks/useToastAsync.ts`

**Propósito:** Encapsular o padrão de `toast.loading` + `toast.update` para operações assíncronas.

**Status:** ✅ Implementado

**Uso:**
```typescript
const executeAsync = useToastAsync();

await executeAsync({
  action: () => minhaFuncao(params),
  loadingMessage: "Processando...",
  successMessage: "Sucesso!",
  errorMessage: (error) => error.message,
  onSuccess: (result) => { /* ... */ },
  onError: (error) => { /* ... */ },
});
```

**Arquivos aplicados:**
- `src/pages/dashProvas/modals/newProva.tsx`
- `src/pages/dashGeo/modals/modalEditDashGeo/index.tsx`
- `src/pages/dashContent/modals/validatedDemand.tsx`
- `src/components/organisms/loginForm/index.tsx`
- `src/components/organisms/resetForm/index.tsx`
- `src/pages/confirmEnrolled/declareInterest.tsx`
- `src/pages/dashSimulado/index.tsx`
- `src/pages/dashRoles/modals/ModalSendEmail.tsx`
- E mais ~30 arquivos pendentes

---

### 2. `useModal` e `useModals`

**Localização:** `src/hooks/useModal.ts`

**Propósito:** Simplificar o gerenciamento de estados de modais (abrir/fechar).

**Status:** ✅ Implementado

**Uso:**
```typescript
// Para um único modal
const modal = useModal();
<Modal isOpen={modal.isOpen} onClose={modal.close} />
<Button onClick={modal.open}>Abrir</Button>

// Para múltiplos modais
const modals = useModals(['create', 'edit', 'delete']);
<CreateModal isOpen={modals.create.isOpen} onClose={modals.create.close} />
<Button onClick={modals.create.open}>Criar</Button>
```

**Arquivos aplicados:**
- `src/pages/partnerPrepInscritionStudentManager/index.tsx`

**Candidatos para aplicação:**
- `src/pages/dashContent/index.tsx` (4 modais)
- `src/pages/dashQuestion/index.tsx` (2 modais)
- `src/pages/partnerClass/index.tsx` (3 modais)
- `src/pages/studentsEnrolled/index.tsx` (5 modais)
- E mais ~20 arquivos

---

## 🚧 Hooks Pendentes

### 3. `usePaginatedData` ou `usePaginatedFetch`

**Status:** 📝 Pendente de implementação

#### 🎯 Problema Identificado

Múltiplos componentes implementam lógica similar de paginação:
- Estados para `page`, `limit`, `totalItems`, `loading`
- Função de busca assíncrona
- Lógica de `getMoreCards`
- Controle de erro e loading

#### 📍 Padrão Atual Repetido

```typescript
// Padrão encontrado em dashQuestion, dashContent, partnerClass, etc.
const [entities, setEntities] = useState<T[]>([]);
const [page, setPage] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const limitCards = 100;

useEffect(() => {
  getAllData(token, status, page, limitCards)
    .then((res) => {
      setEntities(res.data);
      setTotalItems(res.totalItems);
    })
    .catch((erro) => {
      toast.error(erro.message);
    });
}, [token, status, page]);

const getMoreCards = async (page: number): Promise<Paginate<T>> => {
  return await getAllData(token, status, page, limitCards);
};
```

#### ✨ Proposta de Implementação

```typescript
// src/hooks/usePaginatedData.ts
interface UsePaginatedDataOptions<T> {
  fetchFn: (page: number, limit: number, ...args: any[]) => Promise<Paginate<T>>;
  limit?: number;
  dependencies?: any[];
  onError?: (error: Error) => void;
}

export function usePaginatedData<T>(options: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await options.fetchFn(pageNumber, options.limit || 40);
      setData(result.data);
      setTotalItems(result.totalItems);
      setPage(pageNumber);
    } catch (err) {
      setError(err as Error);
      options.onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...(options.dependencies || [])]);

  return {
    data,
    setData,
    page,
    setPage,
    totalItems,
    loading,
    error,
    refetch: () => fetchData(page),
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
  };
}
```

#### 🔧 Exemplo de Uso Proposto

```typescript
// ANTES
function DashQuestion() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limitCards = 100;

  useEffect(() => {
    getAllQuestions(token, status, filterText, page, limitCards)
      .then((res) => {
        setQuestions(res.data);
        setTotalItems(res.totalItems);
      })
      .catch((erro) => {
        toast.error(erro.message);
      });
  }, [token, status, page]);

  const getMoreCards = async (page: number) => {
    return await getAllQuestions(token, status, filterText, page, limitCards);
  };
}

// DEPOIS
function DashQuestion() {
  const { data: questions, setData: setQuestions, totalItems, loading, refetch } = usePaginatedData({
    fetchFn: (page, limit) => getAllQuestions(token, status, filterText, page, limit),
    limit: 100,
    dependencies: [token, status, filterText],
    onError: (error) => toast.error(error.message),
  });

  const getMoreCards = refetch;
}
```

#### 📂 Arquivos Candidatos

1. **Alta prioridade** (lógica complexa):
   - `src/pages/dashQuestion/index.tsx` (linhas 28-184)
   - `src/pages/dashContent/index.tsx` (linhas 35-171)
   - `src/pages/partnerClass/index.tsx` (linhas 42-97)
   - `src/pages/studentsEnrolled/index.tsx` (linhas 64-86)

2. **Média prioridade**:
   - `src/pages/dashGeo/index.tsx`
   - `src/pages/dashProvas/index.tsx`
   - `src/pages/managerCollaborator/index.tsx`
   - `src/pages/partnerPrepInscriptionManager/index.tsx`

3. **Componentes com scroll infinito**:
   - `src/components/templates/dashCardTemplate/index.tsx` (linhas 36-72)

#### 💡 Benefícios Esperados

- ✅ Redução de ~30-50 linhas por componente
- ✅ Lógica de paginação centralizada
- ✅ Fácil adicionar features (cache, otimização)
- ✅ Tratamento de erro consistente
- ✅ Loading states padronizados

#### 🔗 Possíveis Extensões

```typescript
// Variação para scroll infinito
export function useInfiniteScroll<T>(options: UseInfiniteScrollOptions<T>) {
  // Similar ao usePaginatedData mas acumula dados
  // ao invés de substituir
}

// Variação com cache
export function usePaginatedDataWithCache<T>(options: UsePaginatedDataWithCacheOptions<T>) {
  // Adiciona React Query ou cache customizado
}
```

---

### 4. `useFormFieldTracking` ou `useFormChanges`

**Status:** 📝 Pendente de implementação

#### 🎯 Problema Identificado

Vários formulários precisam detectar se houve mudanças para:
- Habilitar/desabilitar botão de salvar
- Mostrar avisos de "unsaved changes"
- Validar se deve fazer a requisição

#### 📍 Padrão Atual Repetido

```typescript
// Padrão encontrado em accountForm, modalEditGeo, etc.
const [hasChanges, setHasChanges] = useState(false);
const [originalData, setOriginalData] = useState(userAccount);

// Função para detectar mudanças nos campos
useEffect(() => {
  const checkChanges = () => {
    const hasChanged = 
      firstName !== originalData.firstName ||
      lastName !== originalData.lastName ||
      phone !== originalData.phone ||
      // ... mais campos
    setHasChanges(hasChanged);
  };
  checkChanges();
}, [firstName, lastName, phone, originalData]);
```

#### ✨ Proposta de Implementação

```typescript
// src/hooks/useFormChanges.ts
interface UseFormChangesOptions<T> {
  originalData: T;
  currentData: T;
  compareFields?: (keyof T)[];
  deepCompare?: boolean;
}

export function useFormChanges<T extends Record<string, any>>(
  options: UseFormChangesOptions<T>
) {
  const [hasChanges, setHasChanges] = useState(false);
  const [changedFields, setChangedFields] = useState<Set<keyof T>>(new Set());

  useEffect(() => {
    const fieldsToCompare = options.compareFields || 
      (Object.keys(options.originalData) as (keyof T)[]);
    
    const changes = new Set<keyof T>();
    let hasAnyChange = false;

    fieldsToCompare.forEach((field) => {
      const original = options.originalData[field];
      const current = options.currentData[field];
      
      const isDifferent = options.deepCompare 
        ? JSON.stringify(original) !== JSON.stringify(current)
        : original !== current;
      
      if (isDifferent) {
        changes.add(field);
        hasAnyChange = true;
      }
    });

    setChangedFields(changes);
    setHasChanges(hasAnyChange);
  }, [options.originalData, options.currentData, options.compareFields, options.deepCompare]);

  const resetChanges = () => {
    setHasChanges(false);
    setChangedFields(new Set());
  };

  const isFieldChanged = (field: keyof T) => changedFields.has(field);

  return {
    hasChanges,
    changedFields: Array.from(changedFields),
    isFieldChanged,
    resetChanges,
  };
}
```

#### 🔧 Exemplo de Uso Proposto

```typescript
// ANTES
function AccountForm({ userAccount }) {
  const [hasChanges, setHasChanges] = useState(false);
  const { watch } = useForm();
  
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const phone = watch('phone');

  useEffect(() => {
    const changed = 
      firstName !== userAccount.firstName ||
      lastName !== userAccount.lastName ||
      phone !== userAccount.phone;
    setHasChanges(changed);
  }, [firstName, lastName, phone, userAccount]);

  return (
    <Button disabled={!hasChanges}>Salvar</Button>
  );
}

// DEPOIS
function AccountForm({ userAccount }) {
  const { watch } = useForm();
  
  const { hasChanges, changedFields, isFieldChanged } = useFormChanges({
    originalData: userAccount,
    currentData: {
      firstName: watch('firstName'),
      lastName: watch('lastName'),
      phone: watch('phone'),
    },
  });

  return (
    <>
      <Button disabled={!hasChanges}>Salvar</Button>
      {changedFields.length > 0 && (
        <span>Campos alterados: {changedFields.join(', ')}</span>
      )}
    </>
  );
}
```

#### 📂 Arquivos Candidatos

1. **Implementação atual manual**:
   - `src/components/organisms/accountForm/index.tsx` (linhas 85-103)
   - `src/pages/dashGeo/modals/modalEditDashGeo/index.tsx`
   - `src/pages/partnerPrepManager/modals/ModalShowPrepCourse/modalPrepCoursePrincipal.tsx`

2. **Formulários que poderiam se beneficiar**:
   - `src/pages/partnerPrepForm/modals/modalCreateQuestion.tsx`
   - `src/pages/partnerClass/modals/classCreateEditModal.tsx`
   - `src/pages/partnerPrepInscriptionManager/modals/InscriptionInfoModal.tsx`

#### 💡 Benefícios Esperados

- ✅ Detecção automática de mudanças
- ✅ Lista de campos alterados para debugging
- ✅ Comparação profunda opcional (objetos/arrays)
- ✅ Destaque visual de campos alterados
- ✅ Prevenção de salvamentos desnecessários

#### 🔗 Integração com React Hook Form

```typescript
// Variação específica para react-hook-form
export function useFormChangesWithRHF<T extends FieldValues>(
  formMethods: UseFormReturn<T>,
  originalData: T
) {
  const watchedFields = formMethods.watch();
  
  return useFormChanges({
    originalData,
    currentData: watchedFields,
  });
}
```

---

## 📊 Análise de Padrões

### Resumo de Oportunidades

| Hook | Status | Arquivos Afetados | Linhas Economizadas | Prioridade |
|------|--------|-------------------|---------------------|------------|
| `useToastAsync` | ✅ Implementado | 41 arquivos | ~20-30 por arquivo | Alta |
| `useModal` | ✅ Implementado | ~25 arquivos | ~15-20 por arquivo | Alta |
| `usePaginatedData` | 📝 Pendente | ~15 arquivos | ~30-50 por arquivo | Média-Alta |
| `useFormChanges` | 📝 Pendente | ~8 arquivos | ~20-30 por arquivo | Média |

### Impacto Total Estimado

- **Linhas de código removidas:** ~1500-2000 linhas
- **Manutenibilidade:** Significativamente melhorada
- **Consistência:** Padrões unificados em toda aplicação
- **DX (Developer Experience):** Muito melhor para novos desenvolvedores

---

## 🎓 Princípios para Criação de Hooks

### ✅ Quando criar um hook:

1. **Repetição clara** - Padrão usado em 3+ lugares
2. **Lógica não-trivial** - Mais que um simples wrapper
3. **Melhora legibilidade** - Código fica mais limpo
4. **Reutilizável** - Aplicável em diferentes contextos

### ❌ Quando NÃO criar um hook:

1. **Usado em um único lugar** - Não justifica abstração
2. **Wrapper trivial** - Ex: `useState` com nome diferente
3. **Esconde lógica importante** - Dificulta entendimento
4. **Over-engineering** - Complexidade desnecessária

---

## 🚀 Próximos Passos

### Implementação Recomendada

1. ✅ ~~`useToastAsync`~~ - Implementado
2. ✅ ~~`useModal`~~ - Implementado  
3. 🔜 `usePaginatedData` - Próximo na fila
4. 🔜 `useFormChanges` - Após paginação

### Roadmap

- [ ] Implementar `usePaginatedData`
- [ ] Aplicar em 5 componentes principais
- [ ] Documentar lições aprendidas
- [ ] Implementar `useFormChanges`
- [ ] Criar testes unitários para hooks
- [ ] Finalizar migração de `useToastAsync`
- [ ] Finalizar migração de `useModal`

---

## 📚 Referências

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript + Hooks](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks)

---

**Última atualização:** 2025-10-30  
**Mantido por:** Equipe de Desenvolvimento VcNaFacul




