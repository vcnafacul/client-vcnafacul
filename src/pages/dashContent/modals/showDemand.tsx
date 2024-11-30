import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { ReactComponent as DocxIcon } from "../../../assets/icons/docx.svg";
import Content from "../../../components/atoms/content";
import Text from "../../../components/atoms/text";
import PropValue from "../../../components/molecules/PropValue";
import Button from "../../../components/molecules/button";
import UploadButton from "../../../components/molecules/uploadButton";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { getMateriaString } from "../../../enums/content/materias";
import { Roles } from "../../../enums/roles/roles";
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
  const [tryUpload, setTryUpload] = useState<boolean>(false);
  const [tryDelete, setTryDelete] = useState<boolean>(false);
  const [upload, setUpload] = useState<boolean>(false);
  const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadFile, setUploadFile] = useState<any>(null);

  const {
    data: { permissao, token },
  } = useAuthStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileUpload = (e: any) => {
    setUploadFile(null);
    setArrayBufer(undefined);
    setUpload(false);
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result;
        setUpload(true);
        setArrayBufer(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const MyContent = useCallback(() => {
    if (upload) {
      return <Content className="" arrayBuffer={arrayBuffer} />;
    }
    return (
      <div className="flex justify-center p-4">
        <DocxIcon className="w-28 h-28" />
        <span className="px-2 pt-1 border-2 border-blue-400 h-fit rounded-t-2xl rounded-r-2xl">
          Eu sou o docxinho, seu amiguinho
        </span>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload]);

  const upFile = () => {
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

  const ModalTryUpload = () => {
    return (
      <ModalConfirmCancel
        isOpen={tryUpload}
        handleClose={() => setTryUpload(false)}
        handleConfirm={upFile}
      >
        <div>
          <Text className="m-0" size="secondary">
            Tem certeza ?
          </Text>
          <Text size="quaternary">
            Ao fazer o upload você não podera alterar mais as informações
          </Text>
        </div>
      </ModalConfirmCancel>
    );
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
      >
        <div>
          <Text size="secondary">
            Tem certeza que deseja excluir essa demanda ?
          </Text>
        </div>
      </ModalConfirmCancel>
    );
  };

  const Buttons = () => {
    return (
      <div className="flex gap-4">
        <Button disabled={!uploadFile} onClick={() => setTryUpload(true)}>
          Salvar
        </Button>
        {permissao[Roles.gerenciadorDemanda] ? (
          <Button className="bg-red" onClick={() => setTryDelete(true)}>
            Excluir
          </Button>
        ) : (
          <></>
        )}
        <Button onClick={handleClose}>Fechar</Button>
      </div>
    );
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-full max-w-6xl p-4"
    >
      <>
        <div className=" sm:relative">
          <Text size="secondary" className="">
            {demand.title}
          </Text>
          <PropValue
            prop="Materia"
            value={getMateriaString(demand.subject.frente.materia)}
          />
          <PropValue prop="Frente" value={demand.subject.frente.name} />
          <div className="flex flex-col">
            <PropValue prop="Tema" value={demand.subject.name} />
            <span className="self-end">{demand.subject.description}</span>
          </div>
          <div className="p-4">
            <span>{demand.description}</span>
          </div>

          {permissao[Roles.uploadDemanda] ? (
            <>
              <div className="overflow-y-auto scrollbar-hide w-full max-h-[50vh] border relative">
                <MyContent />
              </div>
              <UploadButton placeholder="Upload" onChange={handleFileUpload} />
            </>
          ) : (
            <></>
          )}
          <Buttons />
        </div>
      </>
      <ModalTryUpload />
      <ModalTryDelete />
    </ModalTemplate>
  );
}

export default ShowDemand;
