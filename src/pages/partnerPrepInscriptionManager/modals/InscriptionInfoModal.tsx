import { ReactComponent as TrashIcon } from "@/assets/icons/trash.svg";
import Button from "@/components/molecules/button";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalMessage from "@/components/organisms/modalMessage";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getSubscribers } from "@/services/prepCourse/inscription/getSubscribers";
import { useAuthStore } from "@/store/auth";
import { usePrepCourseStore } from "@/store/prepCourse";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { StudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { formatDate } from "@/utils/date";
import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import { dataInscription } from "../data";
import {
  InscriptionInfoCreateEditModal,
  InscriptionOutput,
} from "./InscriptionInfoCreateEditModal";

import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { questions } from "@/pages/partnerPrepInscription/data";

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

  const flattenData = (data: StudentCourseFull[], questions: string[]) => {
    return data.map((student) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flattenedItem: any = { ...student };

      // Preenche as respostas socioeconômicas
      questions.forEach((question) => {
        // Encontra a resposta para a pergunta atual
        const socioItem = student.socioeconomic.find(
          (item) => item.question === question
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
    getSubscribers(token, inscriptionSelected!.id!).then((data) => {
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
      XLSX.writeFile(workbook, `${Date.now()}.xlsx`);
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
    <ModalTemplate isOpen={isOpen} handleClose={handleClose}>
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
        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row">
          <Button className="h-8 w-36" onClick={() => exportToExcel()}>
            <div className="flex justify-center gap-1.5">
              <MdOutlineFileDownload />
              <p className="text-sm w-fit">Lista de Alunos</p>
            </div>
          </Button>
          <div className="flex flex-1 justify-end gap-4">
            <Button
              className="w-24 h-8 bg-red border-red"
              onClick={() => setOpenModalDelete(true)}
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
