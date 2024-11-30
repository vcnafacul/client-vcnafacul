import { ReactComponent as TrashIcon } from "@/assets/icons/trash.svg";
import Button from "@/components/molecules/button";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalMessage from "@/components/organisms/modalMessage";
import ModalTemplate from "@/components/templates/modalTemplate";
import * as ShadcnButton from "@/components/ui/button";
import { getSubscribers } from "@/services/prepCourse/inscription/getSubscribers";
import { useAuthStore } from "@/store/auth";
import { usePrepCourseStore } from "@/store/prepCourse";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { formatDate } from "@/utils/date";
import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import { dataInscription } from "../data";
import {
  InscriptionInfoCreateEditModal,
  InscriptionOutput,
} from "./InscriptionInfoCreateEditModal";

import { ShadcnTooltip } from "@/components/atoms/shadnTooltip";
import BLink from "@/components/molecules/bLink";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { questions } from "@/pages/partnerPrepInscription/data";
import { DASH, PARTNER_PREP_INSCRIPTION } from "@/routes/path";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

interface InscriptionInfoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  inscription?: Inscription | undefined;
  canEdit?: boolean;
  handleEdit: (data: InscriptionOutput) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function InscriptionInfoModal({
  isOpen,
  handleClose,
  inscription,
  handleEdit,
  handleDelete,
  canEdit = true,
}: InscriptionInfoModalProps) {
  const [inscriptionSelected, setInscriptionSelected] = useState<
    Inscription | undefined
  >(inscription);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openModalNotAllowEdit, setOpenModalNotAllowEdit] = useState(false);

  const {
    data: { token },
  } = useAuthStore();
  const { data } = usePrepCourseStore();

  const ModalDelete = () => {
    return (
      <ModalConfirmCancel
        isOpen={openModalDelete}
        handleClose={() => {
          setOpenModalDelete(false);
        }}
        text={dataInscription.warningDeleteTitle}
        handleConfirm={() => {
          handleDelete().then(() => {
            setOpenModalDelete(false);
            handleClose();
          });
        }}
        className="bg-white p-2 rounded-md"
      >
        <p>{dataInscription.warningDelete}</p>
      </ModalConfirmCancel>
    );
  };

  const ModalNotAllowEdit = () => {
    return (
      <ModalMessage
        isOpen={openModalNotAllowEdit}
        handleClose={() => {
          setOpenModalNotAllowEdit(false);
        }}
        text=""
      >
        <p>{dataInscription.messageNotAllowEdit}</p>
      </ModalMessage>
    );
  };

  const myHandleEdit = (data: InscriptionOutput) => {
    handleEdit(data).then(() => {
      setInscriptionSelected({
        ...inscriptionSelected!,
        name: data.name,
        description: data.description,
        openingsCount: data.openingsCount,
        startDate: data.range[0],
        endDate: data.range[1],
      });
      setOpenModalEdit(false);
    });
  };

  const ModalEdit = () => {
    return openModalEdit ? (
      <InscriptionInfoCreateEditModal
        isOpen={openModalEdit}
        inscription={inscriptionSelected!}
        handleClose={() => setOpenModalEdit(false)}
        onCreateEdit={myHandleEdit}
      />
    ) : null;
  };

  const onEdit = () => {
    if (canEdit) {
      setOpenModalEdit(true);
    } else {
      setOpenModalNotAllowEdit(true);
    }
  };

  const flattenData = (data: XLSXStudentCourseFull[], questions: string[]) => {
    return data.map((student) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flattenedItem: any = { ...student };

      // Preenche as respostas socioeconômicas
      questions.forEach((question) => {
        // Encontra a resposta para a pergunta atual
        const socioItem = student.socioeconomic.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => item.question === question
        );

        // Se a pergunta tiver uma resposta, coloca-a na coluna, senão deixa vazio
        if (!socioItem) flattenedItem[question] = "";
        else {
          const answer =
            typeof socioItem.answer === "object"
              ? socioItem.answer.join(", ")
              : socioItem.answer;
          flattenedItem[question] = flattenedItem[question]
            ? `${flattenedItem[question]}, ${answer}`
            : answer;
        }
      });

      // Remover o campo "socioeconomic" original se não quiser mantê-lo
      delete flattenedItem.socioeconomic;

      return flattenedItem;
    });
  };

  const exportToExcel = () => {
    const id = toast.loading("Exportando lista de alunos...");
    getSubscribers(token, inscriptionSelected!.id!)
      .then((data) => {
        const flattenedData = flattenData(data, questions);

        flattenedData.sort((a, b) => {
          if (a.cadastrado_em < b.cadastrado_em) return -1;
          if (a.cadastrado_em > b.cadastrado_em) return 1;
          return 0;
        });

        const worksheet = XLSX.utils.json_to_sheet(flattenedData);

        // Cria um novo workbook e adiciona a planilha
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

        // Gera o arquivo Excel e faz o download
        toast.dismiss(id);
        XLSX.writeFile(workbook, `${Date.now()}.xlsx`);
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao exportar lista de alunos",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
    // Cria uma nova planilha a partir dos dados
  };
  const clipboard = () => {
    const linkPrepCourse = `${
      import.meta.env.VITE_APP_BASE_URL
    }/cursinho/inscricao/${data.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(linkPrepCourse)
        .then(() => {
          toast.info("Link copiado com sucesso!");
        })
        .catch(() => {
          toast.error("Erro ao copiar link!");
        });
    }
  };

  return (
    <ModalTemplate isOpen={isOpen} handleClose={handleClose} className="bg-white p-4 rounded-md">
      <div className=" max-w-2xl min-w-[90%] sm:min-w-[550px] flex flex-col gap-4">
        <h1 className="text-left text-marine text-3xl font-black">
          {dataInscription.inscription}
        </h1>
        <h3 className="font-black text-xl text-marine">
          {inscriptionSelected?.name}
        </h3>
        <p>{inscriptionSelected?.description}</p>
        <h3 className="font-black text-xl text-marine">Data</h3>
        <div className="flex gap-4">
          <p>
            <strong>Início:</strong>
            {inscriptionSelected?.startDate
              ? formatDate(inscriptionSelected?.startDate.toString())
              : ""}
          </p>
          <p>
            <strong>Final:</strong>
            {inscriptionSelected?.startDate
              ? formatDate(inscriptionSelected?.endDate.toString())
              : ""}
          </p>
        </div>
        <h3 className="font-black text-xl text-marine">
          {dataInscription.openingText}
        </h3>
        <div className="flex gap-4">
          <p>
            <strong>Incritos:</strong> {inscriptionSelected?.subscribersCount}
          </p>
          <p>
            <strong>Vagas:</strong> {inscriptionSelected?.openingsCount}
          </p>
        </div>
        <div
          className="flex gap-1.5 items-center justify-end cursor-pointer"
          onClick={clipboard}
        >
          <p className="font-medium">Link de inscrição</p>
          <FaRegCopy />
        </div>
        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row relative">
          <ShadcnTooltip content="Download Lista de Alunos">
            <ShadcnButton.Button
              className="bg-orange hover:bg-orange/60 h-8"
              onClick={() => exportToExcel()}
            >
              <MdOutlineFileDownload className="w-6 h-6" />
            </ShadcnButton.Button>
          </ShadcnTooltip>
          {inscriptionSelected?.actived === StatusEnum.Rejected && (
            <BLink
              className="h-8 w-36 bg-green2 border-none hover:bg-green2/60"
              to={`${DASH}/${PARTNER_PREP_INSCRIPTION}/${inscriptionSelected?.id}`}
            >
              <div className="flex justify-center gap-1.5">
                <p className="text-sm w-fit">Lista de Alunos</p>
              </div>
            </BLink>
          )}
          <div className="flex flex-1 justify-end gap-4">
            <Button
              className="w-24 h-8 bg-red border-none hover:bg-red/60 "
              onClick={() => setOpenModalDelete(true)}
              disabled={inscriptionSelected!.subscribersCount > 0}
            >
              <div className="flex justify-center gap-1.5">
                <TrashIcon />
                <p className="text-sm w-fit">Deletar</p>
              </div>
            </Button>
            <Button typeStyle="secondary" className="w-24 h-8" onClick={onEdit}>
              Editar
            </Button>
          </div>
        </div>
        <ModalEdit />
        <ModalDelete />
        <ModalNotAllowEdit />
      </div>
    </ModalTemplate>
  );
}
