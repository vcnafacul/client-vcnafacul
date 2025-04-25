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
import { getFile } from "@/services/content/getFile";
import { resetDemand } from "@/services/content/resetDemand";
import { updateStatus } from "@/services/content/updateStatus";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: { token, permissao },
  } = useAuthStore();

  useEffect(() => {
    const fetchFile = async () => {
      if (demand.file?.id) {
        const id = toast.loading("Carregando documento ...");
        try {
          const blob = await getFile(demand.file.id, token);
          setBlob(blob);
          setArrayBuffer(await blob.arrayBuffer());
          toast.dismiss(id);
        } catch (error) {
          toast.update(id, {
            render: "Erro ao baixar documento",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      }
    };
    fetchFile();
  }, [demand.file?.id, token]);

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
    const id = toast.loading("Atualizando status...");
    try {
      await updateStatus(demand.id, status, token);
      updateStatusDemand(demand.id);
      toast.update(id, {
        render: "Status atualizado com sucesso",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      handleClose();
    } catch (error: any) {
      toast.update(id, {
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleReset = async () => {
    const id = toast.loading("Resetando demanda...");
    try {
      await resetDemand(demand.id, token);
      updateStatusDemand(demand.id);
      toast.update(id, {
        render: "Demanda resetada",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      handleClose();
    } catch (error: any) {
      toast.update(id, {
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-6">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-marine">
              Validação da Demanda
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-black text-marine">Título:</p>
                <p>{demand.title}</p>
              </div>
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
                  onClick={() => setShowPreview(true)}
                >
                  Visualizar
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <Button
                variant="default"
                className="bg-green2 hover:bg-green2/80"
                onClick={() => handleUpdateStatus(StatusEnum.Approved)}
                disabled={
                  !permissao[Roles.validarDemanda] ||
                  demand.status === StatusEnum.Approved
                }
              >
                Aprovar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus(StatusEnum.Rejected)}
                disabled={
                  !permissao[Roles.validarDemanda] ||
                  demand.status === StatusEnum.Rejected
                }
              >
                Rejeitar
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!permissao[Roles.validarDemanda]}
              >
                Resetar
              </Button>
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
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
