/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Content from "../../../components/atoms/content";
import Text from "../../../components/atoms/text";
import PropValue from "../../../components/molecules/PropValue";
import BLink from "../../../components/molecules/bLink";
import Button from "../../../components/molecules/button";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import { ModalProps } from "../../../components/templates/modalTemplate";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { StatusContent } from "../../../enums/content/statusContent";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { resetDemand } from "../../../services/content/resetDemand";
import { updateStatus } from "../../../services/content/updateStatus";
import { useAuthStore } from "../../../store/auth";

interface ValidatedDemandProps extends ModalProps {
  demand: ContentDtoInput;
  updateStatusDemand: (id: number) => void;
}

function ValidatedDemand({
  handleClose,
  demand,
  updateStatusDemand,
}: ValidatedDemandProps) {
  const [tryReset, setTryReset] = useState<boolean>(false);
  const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

  const {
    data: { token },
  } = useAuthStore();
  const MyContent = useCallback(() => {
    if (demand.filename) {
      return (
        <div className="flex w-full justify-center py-4 overflow-y-auto scrollbar-hide max-h-[40vh]">
          <Content docxFilePath={`${VITE_BASE_FTP}${demand.filename}`} />
        </div>
      );
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatusContent = (status: StatusContent | StatusEnum) => {
    const id = toast.loading("Atualizando Status ... ");
    updateStatus(demand.id, status, token)
      .then((_) => {
        updateStatusDemand(demand.id);
        toast.update(id, {
          render: `Status Atualizado`,
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

  const reset = () => {
    const id = toast.loading("Resetando Demanda ... ");
    resetDemand(demand.id, token)
      .then((_) => {
        updateStatusDemand(demand.id);
        toast.update(id, {
          render: `Resetado`,
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

  const ConfirmReset = () => {
    return (
      <ModalConfirmCancel
        isOpen={tryReset}
        handleClose={() => setTryReset(false)}
        handleConfirm={reset}
        text={""}
      >
        <div>
          <Text className="m-0" size="secondary">
            Tem certeza ?
          </Text>
          <Text size="quaternary">
            Se continuar agora, o arquivo será apagado e o conteúdo voltará a
            Pendente Upload
          </Text>
        </div>
      </ModalConfirmCancel>
    );
  };

  return (
    <>
      <>
        <div className="bg-white py-4 px-8 rounded max-w-7xl w-11/12">
          <div className="flex flex-wrap gap-4 mb-4">
            <PropValue value={demand.title} prop="Titulo" />
            <PropValue value={demand.subject.frente.name} prop="Frente" />
            <PropValue value={demand.subject.name} prop="Tema" />
            <PropValue value={demand.description} prop="Descrição" />
          </div>
          <MyContent />
          <BLink
            size="small"
            type="quaternary"
            className="w-fit mt-4"
            to={`${VITE_BASE_FTP}${demand.filename}`}
          >
            Download
          </BLink>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <Button
              disabled={demand.status === StatusEnum.Approved}
              className="bg-green2 border-green2"
              onClick={() => updateStatusContent(StatusEnum.Approved)}
            >
              Aprovar
            </Button>
            <Button
              disabled={demand.status === StatusEnum.Rejected}
              className="bg-red border-red"
              onClick={() => updateStatusContent(StatusEnum.Rejected)}
            >
              Rejeitar
            </Button>
            <Button
              className="bg-grey border-grey"
              onClick={() => setTryReset(true)}
            >
              Resetar
            </Button>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </div>
      </>
      <ConfirmReset />
    </>
  );
}

export default ValidatedDemand;
