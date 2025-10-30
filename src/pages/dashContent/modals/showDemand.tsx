import DocxPreview from "@/components/atoms/docxPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToastAsync } from "@/hooks/useToastAsync";
import { MateriasLabel } from "@/types/content/materiasLabel";
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

  const modals = useModals([
    'docxPreview',
    'tryDelete',
  ]);

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
        className="bg-white p-4 rounded-md h-full max-h-[90vh] min-h-[600px] overflow-y-auto scrollbar-hide"
      >
        <DocxPreview arrayBuffer={arrayBuffer!} />
      </ModalTemplate>
    );
  };

  const handleUploadFile = async () => {
    const formData = new FormData();
    formData.append("file", uploadFile);

    await executeAsync({
      action: () => uploadFileDemand(demand.id, formData, token),
      loadingMessage: "Upload File Demanda ... ",
      successMessage: "File enviada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demand.id);
        handleClose!();
      },
    });
  };

  const removeDemand = async () => {
    await executeAsync({
      action: () => deleteDemand(demand.id, token),
      loadingMessage: "Deletando Demanda ... ",
      successMessage: "Demanda deletada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demand.id);
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
        <CardHeader>
          <CardTitle className="text-center text-3xl text-marine">
            Visualizar Demanda
          </CardTitle>
          <p className="text-muted-foreground text-center text-xl">
            {demand.title}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={
                MateriasLabel.find(
                  (m) => m.value === demand.subject.frente.materia
                )?.label
              }
              readOnly
              placeholder="Matéria"
            />
            <Input
              value={demand.subject.frente.name}
              readOnly
              placeholder="Frente"
            />
            <Input
              value={demand.subject.name}
              readOnly
              placeholder="Tema"
              className="col-span-2"
            />
          </div>

          <div>
            <Textarea
              value={demand.description}
              readOnly
              placeholder="Descrição"
              className="resize-none h-32"
            />
          </div>

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
          {uploadFile &&
            uploadFile.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <Button onClick={() => modals.docxPreview.open()} className="mt-4">
                Visualizar Preview  
              </Button>
            )}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="default"
              className="w-36"
              onClick={handleUploadFile}
              disabled={!uploadFile}
            >
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
            <Button
              variant="destructive"
              className="w-36"
              onClick={() => modals.tryDelete.open()}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
            <Button variant="outline" className="w-36" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" /> Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
      <ModalDocxPreview />
      <ModalTryDelete />
    </ModalTemplate>
  );
}

export default ShowDemand;
