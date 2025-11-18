# useToastAsync - Exemplos de Uso

## 📋 Visão Geral

O hook `useToastAsync` foi refatorado para suportar dois tipos de operações:

1. **Action sem retorno (void)** - Para operações que não retornam dados
2. **Function com retorno** - Para operações que retornam dados a serem processados

## 🔧 Tipos Suportados

### 1. Action Void (Sem Retorno)

```typescript
interface VoidToastAsyncOptions {
  action: () => Promise<void>;
  loadingMessage: string;
  successMessage?: string;
  errorMessage?: string | ((error: any) => string);
  onSuccess?: () => void;  // ⬅️ Sem parâmetros
  onError?: (error: any) => void;
  onFinally?: () => void;
}
```

### 2. Function com Retorno

```typescript
interface FunctionToastAsyncOptions<T> {
  action: () => Promise<T>;
  loadingMessage: string;
  successMessage?: string | ((result: T) => string);  // ⬅️ Pode usar o resultado
  errorMessage?: string | ((error: any) => string);
  onSuccess?: (result: T) => void;  // ⬅️ Recebe o resultado
  onError?: (error: any) => void;
  onFinally?: () => void;
}
```

## 📚 Exemplos Práticos

### Exemplo 1: Action Void - Deletar Item

```typescript
import { useToastAsync } from "@/hooks/useToastAsync";
import { deleteSection } from "@/services/partnerPrepForm/deleteSection";

function MyComponent() {
  const executeAsync = useToastAsync();

  const handleDelete = async (sectionId: string) => {
    await executeAsync({
      action: () => deleteSection(token, sectionId),
      loadingMessage: "Excluindo seção...",
      successMessage: "Seção excluída com sucesso!",
      errorMessage: "Erro ao excluir seção",
      onSuccess: () => {
        // ✅ Não recebe parâmetros
        refreshList();
      },
    });
  };

  return <button onClick={() => handleDelete("123")}>Excluir</button>;
}
```

### Exemplo 2: Action Void - Duplicar Seção

```typescript
const handleDuplicate = async (sectionId: string) => {
  await executeAsync({
    action: () => duplicateSection(sectionId, token),
    loadingMessage: "Duplicando seção...",
    successMessage: "Seção duplicada com sucesso!",
    errorMessage: "Erro ao duplicar seção",
    onSuccess: () => {
      // ✅ Sem parâmetros - apenas executa ação
      setLoading(true);
      loadSections();
    },
  });
};
```

### Exemplo 3: Function com Retorno - Buscar Dados

```typescript
import { getSection } from "@/services/partnerPrepForm/getSections";

const handleLoadSections = async () => {
  await executeAsync({
    action: () => getSection(token),
    loadingMessage: "Carregando seções...",
    successMessage: (result) => `${result.data.length} seções carregadas`,
    errorMessage: "Erro ao carregar seções",
    onSuccess: (result) => {
      // ✅ Recebe o resultado da API
      setEntities(result.data);
      console.log("Total:", result.data.length);
    },
  });
};
```

### Exemplo 4: Function com Retorno - Criar Item

```typescript
import { createSection } from "@/services/partnerPrepForm/createSection";

const handleCreate = async (data: CreateSectionDto) => {
  await executeAsync({
    action: () => createSection(data, token),
    loadingMessage: "Criando seção...",
    successMessage: (newSection) => `Seção "${newSection.name}" criada!`,
    errorMessage: "Erro ao criar seção",
    onSuccess: (newSection) => {
      // ✅ Recebe a nova seção criada
      setEntities((prev) => [...prev, newSection]);
      closeModal();
    },
  });
};
```

### Exemplo 5: Function com Retorno - Buscar e Processar

```typescript
interface UserData {
  id: string;
  name: string;
  email: string;
}

const handleFetchUser = async (userId: string) => {
  await executeAsync({
    action: () => fetchUser(userId),
    loadingMessage: "Buscando usuário...",
    successMessage: (user) => `Bem-vindo, ${user.name}!`,
    errorMessage: (error) => `Erro: ${error.message}`,
    onSuccess: (user) => {
      // ✅ Tipo seguro - user é do tipo UserData
      setCurrentUser(user);
      navigate(`/profile/${user.id}`);
    },
    onError: (error) => {
      console.error("Falha ao buscar:", error);
    },
  });
};
```

### Exemplo 6: Action Void - Toggle Status

```typescript
const handleToggleStatus = async (itemId: string, currentStatus: boolean) => {
  await executeAsync({
    action: () => toggleItemStatus(token, itemId),
    loadingMessage: currentStatus ? "Desativando..." : "Ativando...",
    successMessage: currentStatus ? "Item desativado" : "Item ativado",
    errorMessage: "Erro ao alterar status",
    onSuccess: () => {
      // ✅ Sem retorno - apenas atualiza estado local
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, active: !currentStatus } : item
        )
      );
    },
  });
};
```

### Exemplo 7: Function com Retorno - Upload com Progresso

```typescript
interface UploadResult {
  url: string;
  size: number;
  filename: string;
}

const handleUpload = async (file: File) => {
  await executeAsync({
    action: () => uploadFile(file, token),
    loadingMessage: "Fazendo upload...",
    successMessage: (result) =>
      `Arquivo "${result.filename}" enviado (${formatBytes(result.size)})`,
    errorMessage: "Erro no upload",
    onSuccess: (result) => {
      // ✅ Recebe informações do arquivo enviado
      setUploadedFiles((prev) => [...prev, result]);
      setFileUrl(result.url);
    },
    onFinally: () => {
      setIsUploading(false);
    },
  });
};
```

## 🎯 Quando Usar Cada Tipo

### Use **Action Void** quando:
- ✅ A operação não retorna dados úteis
- ✅ Você só precisa saber se teve sucesso ou não
- ✅ Exemplos: DELETE, PUT, PATCH sem body de resposta

### Use **Function com Retorno** quando:
- ✅ A operação retorna dados que você precisa processar
- ✅ Você quer usar o resultado no callback de sucesso
- ✅ A mensagem de sucesso depende dos dados retornados
- ✅ Exemplos: GET, POST que retorna o item criado

## 🔍 Type Safety (Segurança de Tipos)

O hook usa TypeScript overloads para garantir type safety:

```typescript
// ✅ Correto - Action void
await executeAsync({
  action: () => deleteItem(id),  // Promise<void>
  onSuccess: () => console.log("Deletado"),  // Sem parâmetros
});

// ✅ Correto - Function com retorno
await executeAsync({
  action: () => fetchData(),  // Promise<DataType>
  onSuccess: (data) => setData(data),  // data é do tipo DataType
});

// ❌ Erro - Tentando acessar resultado de action void
await executeAsync({
  action: () => deleteItem(id),  // Promise<void>
  onSuccess: (result) => console.log(result),  // TypeScript error!
});
```

## 📝 Comparação com Versão Anterior

### Antes (Versão Antiga)

```typescript
// Problema: onSuccess sempre esperava um parâmetro, mesmo para void
await executeAsync({
  action: () => deleteSection(token, id),
  onSuccess: (result) => {
    // result seria undefined, mas ainda precisava do parâmetro
    refreshList();
  },
});
```

### Depois (Versão Nova)

```typescript
// ✅ Solução: onSuccess sem parâmetro para actions void
await executeAsync({
  action: () => deleteSection(token, id),
  onSuccess: () => {
    // Mais limpo e semanticamente correto
    refreshList();
  },
});
```

## 🚀 Benefícios da Refatoração

1. **Type Safety**: TypeScript detecta erros em tempo de desenvolvimento
2. **Semântica Clara**: Diferencia claramente actions de functions
3. **Menos Confusão**: onSuccess sem parâmetro quando não há retorno
4. **Retrocompatível**: Código existente continua funcionando
5. **Melhor DX**: Autocomplete e hints mais precisos

## 🔗 Integração com Serviços

Os serviços já estão preparados para trabalhar com os dois tipos:

```typescript
// Serviços void (retornam Promise<void>)
- deleteSection(token, id): Promise<void>
- duplicateSection(id, token): Promise<void>
- setSectionActive(token, id): Promise<void>
- updateSection(token, id, name): Promise<void>

// Serviços com retorno
- getSection(token): Promise<Paginate<SectionForm>>
- createSection(data, token): Promise<SectionForm>
- createQuestion(data, token): Promise<QuestionForm>
```

---

**Nota**: A refatoração mantém compatibilidade com código existente. Você pode migrar gradualmente para a nova forma mais explícita.

