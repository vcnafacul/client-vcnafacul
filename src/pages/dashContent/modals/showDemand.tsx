import DocxPreview from "@/components/atoms/docxPreview";
import {
  TipoDeEnvio,
  TipoDeEnvioToggle,
} from "@/components/molecules/tipoDeEnvio";
import { VideoLinkField } from "@/components/molecules/videoLinkField";
import { sendVideoDemand } from "@/services/content/sendVideoDemand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToastAsync } from "@/hooks/useToastAsync";
import { Save, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import Text from "../../../components/atoms/text";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
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
      <ModalTemplate
        isOpen={modals.docxPreview.isOpen}
        handleClose={() => modals.docxPreview.close()}
        title="Pré-visualização do documento"
        // Sem altura mínima: 600px passava de 90vh em tela baixa. Uma rolagem só (a do overlay).
        className="bg-white p-3 sm:p-4 rounded-md w-full max-w-6xl"
      >
        <DocxPreview arrayBuffer={arrayBuffer!} />
      </ModalTemplate>
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
      <ModalConfirmCancel
        isOpen={modals.tryDelete.isOpen}
        handleClose={() => modals.tryDelete.close()}
        handleConfirm={removeDemand}
        className="bg-white p-8 rounded-md"
      >
        <div>
          <Text size="secondary">
            Tem certeza que deseja excluir essa demanda ?
          </Text>
        </div>
      </ModalConfirmCancel>
    );
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-full max-w-6xl p-4 rounded-md"
    >
      <Card className="border-none shadow-none">
        <CardContent className="space-y-4 p-0 sm:p-2">
          {/* O mesmo cabeçalho da validação: quem pediu, tema, status (050). */}
          <Cabecalho demand={demand} papelDoCriador="Pedida por" />
          <p className="text-sm whitespace-pre-wrap break-words">
            {demand.description}
          </p>

          <h3 className="text-sm font-black text-marine pt-2">
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
                    Clique para fazer upload de um documento
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
          {/*
            Excluir à esquerda, longe de Salvar: é destrutivo e não é o fluxo
            normal. No celular, Salvar por último (mais perto do polegar).
          */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive sm:w-auto"
              onClick={() => modals.tryDelete.open()}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir demanda
            </Button>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="mr-2 h-4 w-4" /> Fechar
              </Button>
              <Button
                variant="default"
                onClick={tipo === "video" ? handleSendVideo : handleUploadFile}
                disabled={tipo === "video" ? !videoId : !uploadFile}
              >
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Como função: <Componente /> declarado no render remontava a cada render. */}
      {ModalDocxPreview()}
      {ModalTryDelete()}
    </ModalTemplate>
  );
}

export default ShowDemand;
