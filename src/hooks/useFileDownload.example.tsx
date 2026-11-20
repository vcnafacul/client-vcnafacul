/**
 * EXEMPLOS DE USO DO HOOK useFileDownload
 * 
 * Este arquivo demonstra diferentes formas de usar o hook useFileDownload
 */

import { useFileDownload } from "./useFileDownload";
import { getDocuments } from "@/services/prepCourse/student/getDocuments";
import { getProfilePhoto } from "@/services/prepCourse/student/getProfilePhoto";
import { useAuthStore } from "@/store/auth";

// ============================================
// EXEMPLO 1: Uso Básico
// ============================================
export function BasicExample() {
  const { token } = useAuthStore().data;
  const { downloadFile, isDownloading } = useFileDownload();

  const handleDownload = async (documentKey: string) => {
    await downloadFile({
      fetchFunction: () => getDocuments(documentKey, token),
      fileKey: documentKey,
    });
  };

  return (
    <button onClick={() => handleDownload("documento-123")} disabled={isDownloading}>
      {isDownloading ? "Baixando..." : "Download"}
    </button>
  );
}

// ============================================
// EXEMPLO 2: Com Callbacks e Custom FileName
// ============================================
export function AdvancedExample() {
  const { token } = useAuthStore().data;
  
  const { downloadFile, isDownloading, error } = useFileDownload({
    showToast: true,
    onSuccess: (fileName) => {
      console.log(`Arquivo ${fileName} baixado com sucesso!`);
      // Pode adicionar analytics, logs, etc.
    },
    onError: (error) => {
      console.error("Falha no download:", error);
      // Pode enviar para sistema de monitoramento
    },
  });

  const handleDownloadWithCustomName = async (photoKey: string, studentName: string) => {
    await downloadFile({
      fetchFunction: () => getProfilePhoto(photoKey, token),
      fileKey: photoKey,
      customFileName: `foto-${studentName}-${new Date().getTime()}.jpg`,
    });
  };

  return (
    <div>
      <button
        onClick={() => handleDownloadWithCustomName("photo-123", "João Silva")}
        disabled={isDownloading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
      >
        {isDownloading ? "Baixando..." : "Download Foto"}
      </button>
      {error && <p className="text-destructive text-body mt-2">{error}</p>}
    </div>
  );
}

// ============================================
// EXEMPLO 3: Download em Lote
// ============================================
export function BatchDownloadExample() {
  const { token } = useAuthStore().data;
  const { downloadFile, isDownloading } = useFileDownload({ showToast: false });

  const handleDownloadMultiple = async (documentKeys: string[]) => {
    let successCount = 0;
    let failCount = 0;

    for (const key of documentKeys) {
      try {
        await downloadFile({
          fetchFunction: () => getDocuments(key, token),
          fileKey: key,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    alert(`Download concluído: ${successCount} sucesso, ${failCount} falhas`);
  };

  return (
    <button
      onClick={() => handleDownloadMultiple(["doc1", "doc2", "doc3"])}
      disabled={isDownloading}
    >
      {isDownloading ? "Baixando múltiplos arquivos..." : "Download Todos"}
    </button>
  );
}

// ============================================
// EXEMPLO 4: Com Loading Spinner
// ============================================
export function WithSpinnerExample() {
  const { token } = useAuthStore().data;
  const { downloadFile, isDownloading } = useFileDownload();

  return (
    <button
      onClick={() =>
        downloadFile({
          fetchFunction: () => getDocuments("doc-key", token),
          fileKey: "documento.pdf",
        })
      }
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded"
    >
      {isDownloading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      )}
      {isDownloading ? "Baixando..." : "📥 Download"}
    </button>
  );
}

// ============================================
// EXEMPLO 5: Integração com Tabela
// ============================================
export function TableIntegrationExample({ documents }: { documents: Array<{ key: string; name: string }> }) {
  const { token } = useAuthStore().data;
  const { downloadFile, isDownloading } = useFileDownload();

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.key}>
            <td>{doc.name}</td>
            <td>
              <button
                onClick={() =>
                  downloadFile({
                    fetchFunction: () => getDocuments(doc.key, token),
                    fileKey: doc.key,
                  })
                }
                disabled={isDownloading}
                className="text-primary hover:underline disabled:opacity-50"
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

// ============================================
// EXEMPLO 6: Download Condicional
// ============================================
export function ConditionalDownloadExample() {
  const { token } = useAuthStore().data;
  const { downloadFile, isDownloading } = useFileDownload();

  const handleSmartDownload = async (fileKey: string, fileType: "document" | "photo") => {
    // Escolhe a função de fetch baseado no tipo
    const fetchFunction =
      fileType === "document"
        ? () => getDocuments(fileKey, token)
        : () => getProfilePhoto(fileKey, token);

    await downloadFile({
      fetchFunction,
      fileKey,
      customFileName: fileType === "photo" ? `foto-${fileKey}` : undefined,
    });
  };

  return (
    <div className="space-x-2">
      <button onClick={() => handleSmartDownload("key-123", "document")} disabled={isDownloading}>
        Download Documento
      </button>
      <button onClick={() => handleSmartDownload("key-456", "photo")} disabled={isDownloading}>
        Download Foto
      </button>
    </div>
  );
}

