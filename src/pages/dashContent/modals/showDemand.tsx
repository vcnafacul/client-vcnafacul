import DocxPreview from "@/components/atoms/docxPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MateriasLabel } from "@/types/content/materiasLabel";
import { Save, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import Text from "../../../components/atoms/text";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { deleteDemand } from "../../../services/content/deleteDemand";
import { uploadFileDemand } from "../../../services/content/uploadFileDemand";
import { useAuthStore } from "../../../store/auth";

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
  const [tryDelete, setTryDelete] = useState<boolean>(false);
  const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadFile, setUploadFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalPreview, setModalPreview] = useState<boolean>(false);

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
    return !modalPreview ? null : (
      <ModalTemplate
        isOpen={modalPreview}
        handleClose={() => setModalPreview(false)}
        title="Pré-visualização do documento"
        className="bg-white p-4 rounded-md h-full max-h-[90vh] min-h-[600px] overflow-y-auto scrollbar-hide"
      >
        <DocxPreview arrayBuffer={arrayBuffer!} />
      </ModalTemplate>
    );
  };

  const handleUploadFile = () => {
    const id = toast.loading("Upload File Demanda ... ");
    const formData = new FormData();
    formData.append("file", uploadFile);
    uploadFileDemand(demand.id, formData, token)
      .then(() => {
        updateStatusDemand(demand.id);
        toast.update(id, {
          render: `Enviado`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleClose!();
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const removeDemand = () => {
    const id = toast.loading("Deletando Demanda ... ");
    deleteDemand(demand.id, token)
      .then(() => {
        updateStatusDemand(demand.id);
        toast.update(id, {
          render: `Deletado`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleClose!();
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const ModalTryDelete = () => {
    return (
      <ModalConfirmCancel
        isOpen={tryDelete}
        handleClose={() => setTryDelete(false)}
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
              <Button onClick={() => setModalPreview(true)} className="mt-4">
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
              onClick={() => setTryDelete(true)}
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
