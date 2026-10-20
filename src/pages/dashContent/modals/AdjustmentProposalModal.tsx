import DocxPreview from "@/components/atoms/docxPreview";
import {
  TipoDeEnvio,
  TipoDeEnvioToggle,
} from "@/components/molecules/tipoDeEnvio";
import { VideoLinkField } from "@/components/molecules/videoLinkField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { useAuthStore } from "@/store/auth";
import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { createProposal } from "@/services/content/adjustmentProposal";

interface AdjustmentProposalModalProps {
  contentId: string;
  isOpen: boolean;
  handleClose: () => void;
  onSuccess: () => void;
}

export default function AdjustmentProposalModal({
  contentId,
  isOpen,
  handleClose,
  onSuccess,
}: AdjustmentProposalModalProps) {
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Proposta pode ser documento ou vídeo — e trocar o tipo do conteúdo (049, D4).
  const [tipo, setTipo] = useState<TipoDeEnvio>("documento");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const trocarTipo = (novo: TipoDeEnvio) => {
    setTipo(novo);
    setUploadFile(null);
    setArrayBuffer(undefined);
    setVideoUrl("");
    setVideoId(null);
  };

  const modals = useModals(["docxPreview"]);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (result instanceof ArrayBuffer) {
          setArrayBuffer(result);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  const handleSubmit = async () => {
    if (tipo === "documento" && !uploadFile) return;
    if (tipo === "video" && !videoId) return;

    // Sempre FormData: a rota é multipart; vídeo vai como campo `url`.
    const formData = new FormData();
    if (tipo === "documento") formData.append("file", uploadFile!);
    else formData.append("url", videoUrl.trim());
    if (comment.trim()) {
      formData.append("comment", comment.trim());
    }

    await executeAsync({
      action: () => createProposal(contentId, formData, token),
      loadingMessage: "Enviando proposta de ajuste...",
      successMessage: "Proposta enviada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setUploadFile(null);
        setArrayBuffer(undefined);
        setVideoUrl("");
        setVideoId(null);
        setComment("");
        onSuccess();
        handleClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-5xl max-h-[90dvh] overflow-y-auto p-3 sm:p-6">
        <DialogTitle className="text-xl font-bold text-marine">
          Propor Ajuste de Conteúdo
        </DialogTitle>

        <div className="flex flex-col gap-4">
          <TipoDeEnvioToggle value={tipo} onChange={trocarTipo} />

          {tipo === "video" && (
            <VideoLinkField
              value={videoUrl}
              onChange={(url, id) => {
                setVideoUrl(url);
                setVideoId(id);
              }}
            />
          )}

          {tipo === "documento" && (
            <div
              className="border-2 border-dashed border-muted rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition"
              onClick={handleUploadClick}
            >
              {uploadFile ? (
                <>
                  <UploadCloud className="h-10 w-10 text-primary mb-2" />
                  <p className="font-medium">{uploadFile.name}</p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Clique para fazer upload do documento (.docx)
                  </p>
                </>
              )}
              <input
                type="file"
                accept=".docx"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          <Textarea
            placeholder="Comentário sobre o ajuste (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none h-24"
          />

          {tipo === "documento" &&
            uploadFile &&
            uploadFile.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <Button
                variant="outline"
                onClick={() => modals.docxPreview.open()}
              >
                Visualizar Preview
              </Button>
            )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              className="bg-marine hover:bg-marine/80"
              onClick={handleSubmit}
              disabled={tipo === "video" ? !videoId : !uploadFile}
            >
              Enviar Proposta
            </Button>
          </div>
        </div>
      </DialogContent>

      <Dialog
        open={modals.docxPreview.isOpen}
        onOpenChange={modals.docxPreview.close}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-6xl max-h-[90dvh] overflow-y-auto p-3 sm:p-6">
          <DialogTitle className="sr-only">
            Pre-visualizacao do documento
          </DialogTitle>
          {arrayBuffer && <DocxPreview arrayBuffer={arrayBuffer} />}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
