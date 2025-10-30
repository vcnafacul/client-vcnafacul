/* eslint-disable @typescript-eslint/no-explicit-any */
import DocxPreview from "@/components/atoms/docxPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getFile } from "@/services/content/getFile";
import { resetDemand } from "@/services/content/resetDemand";
import { updateStatus } from "@/services/content/updateStatus";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

interface ValidatedDemandProps {
  demand: ContentDtoInput;
  updateStatusDemand: (id: string) => void;
  isOpen: boolean;
  handleClose: () => void;
}

export default function ValidatedDemand({
  demand,
  updateStatusDemand,
  isOpen,
  handleClose,
}: ValidatedDemandProps) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();

  const modals = useModals([
    'docxPreview',
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const canReview: boolean =
    permissao[Roles.validarDemanda] &&
    demand.status !== StatusContent.Pending_Upload;

  useEffect(() => {
    const fetchFile = async () => {
      if (demand.file?.id) {
        await executeAsync({
          action: () => getFile(demand.file!.id, token),
          loadingMessage: "Carregando documento ...",
          successMessage: "Documento carregado com sucesso",
          errorMessage: (error: Error) => error.message,
          onSuccess: (blob: Blob) => {
            setBlob(blob);
            blob.arrayBuffer().then(setArrayBuffer);
          },
        });
      }
    };

    fetchFile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demand.file, demand.file?.id, token]);

  const handleDownload = async () => {
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = demand.file?.originalName || "arquivo.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleUpdateStatus = async (status: StatusEnum | StatusContent) => {
    await executeAsync({
      action: () => updateStatus(demand.id, status, token),
      loadingMessage: "Atualizando status...",
      successMessage: "Status atualizado com sucesso",
      errorMessage: (error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demand.id);
        handleClose();
      },
    });
  };

  const handleReset = async () => {
    await executeAsync({
      action: () => resetDemand(demand.id, token),
      loadingMessage: "Resetando demanda...",
      successMessage: "Demanda resetada",
      errorMessage: (error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demand.id);
        handleClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-6">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-marine">
              {demand.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-black text-marine">Frente:</p>
                <p>{demand.subject.frente.name}</p>
              </div>
              <div>
                <p className="text-sm font-black text-marine">Tema:</p>
                <p>{demand.subject.name}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{demand.description}</p>
            </div>

            {demand.file?.id && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleDownload}>
                  Download
                </Button>
                <Button
                  className="bg-marine hover:bg-marine/80"
                  onClick={() => modals.docxPreview.open()}
                >
                  Visualizar
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <Button
                variant="default"
                className="bg-green2 hover:bg-green2/80"
                onClick={() => handleUpdateStatus(StatusEnum.Approved)}
                disabled={!canReview || demand.status === StatusEnum.Approved}
              >
                Aprovar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus(StatusEnum.Rejected)}
                disabled={!canReview || demand.status === StatusEnum.Rejected}
              >
                Rejeitar
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!canReview}
              >
                Resetar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>

      <Dialog open={modals.docxPreview.isOpen} onOpenChange={modals.docxPreview.close}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto p-6">
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
