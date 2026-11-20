import DocxPreview from "@/components/atoms/docxPreview";
import {
  TipoDeEnvio,
  TipoDeEnvioToggle,
} from "@/components/molecules/tipoDeEnvio";
import { VideoLinkField } from "@/components/molecules/videoLinkField";
import { sendVideoDemand } from "@/services/content/sendVideoDemand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToastAsync } from "@/hooks/useToastAsync";
import { Save, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalProps } from "../../../components/templates/modalTemplate";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { deleteDemand } from "../../../services/content/deleteDemand";
import { uploadFileDemand } from "../../../services/content/uploadFileDemand";
import { useAuthStore } from "../../../store/auth";
import { useModals } from "@/hooks/useModal";
import { Cabecalho } from "./demandaModal/Cabecalho";

interface ShowDemandProps extends ModalProps {
  demand: ContentDtoInput;
  updateStatusDemand: (id: string) => void;
  isOpen: boolean;
}

function ShowDemand({
  demand,
  handleClose,
  isOpen,
  updateStatusDemand,
}: ShowDemandProps) {
  const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadFile, setUploadFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // O tipo é escolhido aqui, no envio (tickets/049): a demanda é neutra.
  const [tipo, setTipo] = useState<TipoDeEnvio>("documento");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const trocarTipo = (novo: TipoDeEnvio) => {
    setTipo(novo);
    // Trocar de lado limpa o outro: não existe envio com os dois.
    setUploadFile(null);
    setArrayBufer(undefined);
    setVideoUrl("");
    setVideoId(null);
  };

  const modals = useModals(["docxPreview", "tryDelete"]);

  const executeAsync = useToastAsync();

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadFile(file);
      if (file) {
        setUploadFile(file);
        const reader = new FileReader();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reader.onload = (event: any) => {
          const arrayBuffer = event.target.result;
          setArrayBufer(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }

  const {
    data: { token },
  } = useAuthStore();

  const ModalDocxPreview = () => {
    return !modals.docxPreview.isOpen ? null : (
      <Dialog
        open={modals.docxPreview.isOpen}
        onOpenChange={(o) => !o && modals.docxPreview.close()}
      >
        <DialogContent size="full" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Pré-visualização do documento</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DocxPreview arrayBuffer={arrayBuffer!} />
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  };

  const demandId = demand.id ?? (demand as { _id?: string })._id ?? "";

  const handleUploadFile = async () => {
    const formData = new FormData();
    formData.append("file", uploadFile);

    await executeAsync({
      action: () => uploadFileDemand(demandId, formData, token),
      loadingMessage: "Enviando documento...",
      successMessage: "Documento enviado com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demandId);
        handleClose!();
      },
    });
  };

  const handleSendVideo = async () => {
    if (!videoId) return;
    await executeAsync({
      action: () => sendVideoDemand(demandId, videoUrl.trim(), token),
      loadingMessage: "Enviando vídeo...",
      successMessage: "Vídeo enviado com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demandId);
        handleClose!();
      },
    });
  };

  const removeDemand = async () => {
    await executeAsync({
      action: () => deleteDemand(demandId, token),
      loadingMessage: "Deletando Demanda ... ",
      successMessage: "Demanda deletada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demandId);
        handleClose!();
      },
    });
  };

  const ModalTryDelete = () => {
    return (
      <AlertDialog
        open={modals.tryDelete.isOpen}
        onOpenChange={(aberto) => {
          if (!aberto) {
            modals.tryDelete.close();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir demanda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir essa demanda ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                removeDemand();
              }}
            >
              Excluir demanda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent
        size="full"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Enviar material da demanda</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {/* O mesmo cabeçalho da validação: quem pediu, tema, status (050). */}
          <Cabecalho demand={demand} papelDoCriador="Pedida por" />
          <p className="text-body whitespace-pre-wrap break-words">
            {demand.description}
          </p>

          <h3 className="text-body font-extrabold text-foreground pt-2">
            O que você vai enviar
          </h3>
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
            <button
              type="button"
              className="border-2 border-dashed border-muted rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition"
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
                    Clique para fazer upload de um documento
                  </p>
                </>
              )}
            </button>
          )}
          <input
            type="file"
            accept=".docx"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Documento da demanda"
          />
          {tipo === "documento" &&
            uploadFile &&
            uploadFile.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => modals.docxPreview.open()}
              >
                Pré-visualizar documento
              </Button>
            )}
          {/* Como função: <Componente /> declarado no render remontava a cada render. */}
          {ModalDocxPreview()}
          {ModalTryDelete()}
        </DialogBody>
        {/*
          Excluir à esquerda, longe de Salvar: é destrutivo e não é o fluxo
          normal. No celular, Salvar por último (mais perto do polegar).
        */}
        <DialogFooter>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive sm:mr-auto"
            onClick={() => modals.tryDelete.open()}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir demanda
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row max-sm:[&>button]:w-full">
            <Button variant="outline" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" /> Fechar
            </Button>
            <Button
              onClick={tipo === "video" ? handleSendVideo : handleUploadFile}
              disabled={tipo === "video" ? !videoId : !uploadFile}
            >
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShowDemand;
