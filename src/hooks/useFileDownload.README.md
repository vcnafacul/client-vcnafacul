# 📥 useFileDownload Hook

Hook React customizado para gerenciar downloads de arquivos com estados de loading, tratamento de erros e notificações.

## 🎯 Características

- ✅ **Gerenciamento de Estado**: Controle automático de loading e erros
- ✅ **Toast Notifications**: Feedback visual automático (opcional)
- ✅ **Callbacks**: Hooks para sucesso e erro
- ✅ **Nome Customizado**: Defina nomes personalizados para arquivos
- ✅ **Detecção Automática**: Identifica extensão do arquivo automaticamente
- ✅ **Memory Safe**: Limpeza automática de URLs temporárias
- ✅ **TypeScript**: Totalmente tipado
- ✅ **Reutilizável**: Use em qualquer componente

## 📦 Instalação

O hook já está disponível em:
```
src/hooks/useFileDownload.ts
```

## 🚀 Uso Básico

```tsx
import { useFileDownload } from "@/hooks/useFileDownload";
import { getDocuments } from "@/services/prepCourse/student/getDocuments";
import { useAuthStore } from "@/store/auth";

function MyComponent() {
  const { token } = useAuthStore().data;
  const { downloadFile, isDownloading } = useFileDownload();

  const handleDownload = async (documentKey: string) => {
    await downloadFile({
      fetchFunction: () => getDocuments(documentKey, token),
      fileKey: documentKey,
    });
  };

  return (
    <button onClick={() => handleDownload("doc-123")} disabled={isDownloading}>
      {isDownloading ? "Baixando..." : "Download"}
    </button>
  );
}
```

## 📚 API

### useFileDownload(options?)

#### Parâmetros

```typescript
interface UseFileDownloadOptions {
  onSuccess?: (fileName: string) => void;  // Callback chamado após sucesso
  onError?: (error: unknown) => void;       // Callback chamado em caso de erro
  showToast?: boolean;                      // Mostrar notificações toast (padrão: true)
}
```

#### Retorno

```typescript
{
  downloadFile: (params: DownloadFileParams) => Promise<Blob>;
  isDownloading: boolean;  // Estado de loading
  error: string | null;    // Mensagem de erro (se houver)
}
```

### downloadFile(params)

#### Parâmetros

```typescript
interface DownloadFileParams {
  fetchFunction: () => Promise<Blob>;  // Função que busca o arquivo
  fileKey: string;                     // Chave/nome do arquivo
  customFileName?: string;             // Nome customizado (opcional)
}
```

## 💡 Exemplos Avançados

### 1. Com Callbacks e Nome Customizado

```tsx
const { downloadFile } = useFileDownload({
  showToast: true,
  onSuccess: (fileName) => {
    console.log(`✅ ${fileName} baixado!`);
    // Enviar analytics
  },
  onError: (error) => {
    console.error("❌ Erro:", error);
    // Enviar para sistema de monitoramento
  },
});

await downloadFile({
  fetchFunction: () => getProfilePhoto(photoKey, token),
  fileKey: photoKey,
  customFileName: `foto-${studentName}-${Date.now()}.jpg`,
});
```

### 2. Desabilitar Toasts (Download Silencioso)

```tsx
const { downloadFile } = useFileDownload({ showToast: false });

await downloadFile({
  fetchFunction: () => getDocuments(key, token),
  fileKey: key,
});
```

### 3. Com Feedback Visual

```tsx
const { downloadFile, isDownloading, error } = useFileDownload();

return (
  <div>
    <button 
      onClick={handleDownload} 
      disabled={isDownloading}
      className="flex items-center gap-2"
    >
      {isDownloading && <Spinner />}
      {isDownloading ? "Baixando..." : "📥 Download"}
    </button>
    {error && <p className="text-red-500">{error}</p>}
  </div>
);
```

### 4. Download em Lote

```tsx
const { downloadFile, isDownloading } = useFileDownload({ showToast: false });

const downloadMultiple = async (keys: string[]) => {
  let success = 0, failed = 0;
  
  for (const key of keys) {
    try {
      await downloadFile({
        fetchFunction: () => getDocuments(key, token),
        fileKey: key,
      });
      success++;
    } catch {
      failed++;
    }
  }
  
  toast.success(`${success} baixados, ${failed} falharam`);
};
```

### 5. Integração com Tabela

```tsx
function DocumentTable({ documents }) {
  const { token } = useAuthStore().data;
  const { downloadFile, isDownloading } = useFileDownload();

  return (
    <table>
      <tbody>
        {documents.map(doc => (
          <tr key={doc.key}>
            <td>{doc.name}</td>
            <td>
              <button
                onClick={() => downloadFile({
                  fetchFunction: () => getDocuments(doc.key, token),
                  fileKey: doc.key,
                })}
                disabled={isDownloading}
              >
                Download
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 🔄 Comparação: Antes vs Depois

### ❌ Antes (Código Duplicado)

```tsx
const handleDownloadDocument = async (key: string) => {
  try {
    const blob = await getDocuments(key, token);
    
    let extension = "";
    if (!key.match(/\.(png|jpeg|jpg|pdf)$/i)) {
      const mimeType = blob.type;
      extension = mimeType.split("/")[1];
    }
    
    const fileName = extension ? `${key}.${extension}` : key;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return blob;
  } catch (error) {
    console.error("Erro ao buscar o arquivo:", error);
  }
};

// Função similar duplicada para fotos...
```

### ✅ Depois (Com Hook)

```tsx
const { downloadFile, isDownloading } = useFileDownload();

const handleDownloadDocument = async (key: string) => {
  await downloadFile({
    fetchFunction: () => getDocuments(key, token),
    fileKey: key,
  });
};

const handleDownloadPhoto = async (key: string) => {
  await downloadFile({
    fetchFunction: () => getProfilePhoto(key, token),
    fileKey: key,
  });
};
```

## 🎨 Extensões do Arquivo Suportadas

O hook detecta automaticamente as seguintes extensões:
- 📄 Documentos: `.pdf`, `.doc`, `.docx`
- 🖼️ Imagens: `.png`, `.jpeg`, `.jpg`

Para outros tipos, o MIME type do blob é usado para determinar a extensão.

## 🛡️ Tratamento de Erros

O hook captura e trata erros automaticamente:

```tsx
try {
  await downloadFile({ ... });
} catch (error) {
  // Erro já foi logado e toast já foi mostrado (se habilitado)
  // Você pode adicionar lógica adicional aqui
}
```

## 🧹 Limpeza de Memória

O hook automaticamente:
1. Cria URLs temporárias com `URL.createObjectURL()`
2. Limpa essas URLs com `URL.revokeObjectURL()` após o download
3. Remove elementos DOM temporários (links)

Isso previne vazamentos de memória! 🎉

## 📝 Notas

- O hook usa `react-toastify` para notificações
- Compatível com TypeScript
- Pode ser usado com qualquer função que retorne `Promise<Blob>`
- Estado de loading é global ao hook (afeta todos os downloads simultâneos)

## 🔗 Arquivos Relacionados

- Hook principal: `src/hooks/useFileDownload.ts`
- Exemplos de uso: `src/hooks/useFileDownload.example.tsx`
- Implementação real: `src/pages/partnerPrepInscritionStudentManager/modal/details.tsx`

## 🤝 Contribuindo

Para melhorar o hook:
1. Adicione novos tipos de arquivo suportados
2. Implemente download com progress bar
3. Adicione suporte a múltiplos downloads paralelos
4. Crie variantes para diferentes casos de uso

---

**Criado com ❤️ para facilitar downloads em toda aplicação!**

