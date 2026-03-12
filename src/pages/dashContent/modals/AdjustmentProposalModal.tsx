import DocxPreview from "@/components/atoms/docxPreview";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("file", uploadFile);
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
        setComment("");
        onSuccess();
        handleClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-6">
        <DialogTitle className="text-xl font-bold text-marine">
          Propor Ajuste de Conteudo
        </DialogTitle>

        <div className="flex flex-col gap-4">
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

          <Textarea
            placeholder="Comentario sobre o ajuste (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none h-24"
          />

          {uploadFile &&
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
              disabled={!uploadFile}
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
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto p-6">
          <DialogTitle className="sr-only">
            Pre-visualizacao do documento
          </DialogTitle>
          {arrayBuffer && (
            <ScrollArea className="h-[70vh]">
              <DocxPreview arrayBuffer={arrayBuffer} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
