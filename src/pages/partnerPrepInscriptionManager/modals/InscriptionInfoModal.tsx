import { ReactComponent as TrashIcon } from "@/assets/icons/trash.svg";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extendInscription } from "@/services/prepCourse/inscription/extend";
import { getSubscribers } from "@/services/prepCourse/inscription/getSubscribers";
import { useAuthStore } from "@/store/auth";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { formatDate } from "@/utils/date";
import { useEffect, useState } from "react";
import { Copy, Download, FileText, FileX, FlaskConical } from "lucide-react";
import { dataInscription } from "../data";
import { ExtendInscriptionModal } from "./ExtendInscriptionModal";
import {
  InscriptionInfoCreateEditModal,
  InscriptionOutput,
} from "./InscriptionInfoCreateEditModal";

import { ShadcnTooltip } from "@/components/atoms/shadnTooltip";
import BLink from "@/components/molecules/bLink";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useToastAsync } from "@/hooks/useToastAsync";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";
import { DASH, PARTNER_PREP_INSCRIPTION } from "@/routes/path";
import { toast } from "@/lib/toast";
import * as XLSX from "xlsx";

interface InscriptionInfoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  inscription?: Inscription | undefined;
  setInscription: (inscription: Inscription) => void;
  canEdit?: boolean;
  handleEdit: (data: InscriptionOutput) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function InscriptionInfoModal({
  isOpen,
  handleClose,
  inscription,
  setInscription,
  handleEdit,
  handleDelete,
}: InscriptionInfoModalProps) {
  const [inscriptionSelected, setInscriptionSelected] = useState<
    Inscription | undefined
  >(inscription);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openModalExtend, setOpenModalExtend] = useState(false);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  // Sincronizar estado local quando a prop inscription mudar
  useEffect(() => {
    if (inscription) {
      setInscriptionSelected(inscription);
    }
  }, [inscription]);

  // Verifica se a data de fim é maior que a data atual
  const canExtend = inscriptionSelected?.endDate
    ? new Date(inscriptionSelected.endDate) < new Date()
    : false;

  const ModalDelete = () => {
    return (
      <AlertDialog
        open={openModalDelete}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setOpenModalDelete(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dataInscription.warningDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dataInscription.warningDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete().then(() => {
                  setOpenModalDelete(false);
                  handleClose();
                });
              }}
            >
              Excluir processo seletivo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const myHandleEdit = (data: InscriptionOutput) => {
    handleEdit(data).then(() => {
      setOpenModalEdit(false);
    });
  };

  const handleExtend = async (endDate: Date) => {
    if (!inscriptionSelected?.id) return;

    await executeAsync({
      action: () => extendInscription(token, inscriptionSelected!.id!, endDate),
      loadingMessage: "Prorrogando processo seletivo...",
      successMessage: "Processo seletivo prorrogado com sucesso!",
      errorMessage: "Erro ao prorrogar processo seletivo",
      onSuccess: () => {
        const inscrption = {
          ...inscriptionSelected!,
          endDate: endDate,
          actived: StatusEnum.Approved, // Atualizar status para Approved
        };
        setInscriptionSelected(inscrption);
        setInscription(inscrption);

        setOpenModalExtend(false);
      },
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

  const ModalExtend = () => {
    return (
      <ExtendInscriptionModal
        isOpen={openModalExtend}
        handleClose={() => setOpenModalExtend(false)}
        handleConfirm={handleExtend}
        currentEndDate={
          inscriptionSelected?.endDate
            ? new Date(inscriptionSelected.endDate)
            : undefined
        }
      />
    );
  };

  const uniqueKeysFromArrays = (...arrays: SocioeconomicAnswer[][]) => [
    ...new Set(arrays.flat().map((obj) => obj.question)),
  ];

  const flattenData = (data: XLSXStudentCourseFull[]) => {
    const keys = uniqueKeysFromArrays(
      ...data.map((student) => student.socioeconomic),
    );
    return data.map((student) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flattenedItem: any = { ...student };
      delete flattenedItem.logs;
      delete flattenedItem.documents;

      // Preenche as respostas socioeconômicas
      keys.forEach((question) => {
        // Encontra a resposta para a pergunta atual
        const socioItem = student.socioeconomic.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => item.question === question,
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

  const exportToExcel = async () => {
    await executeAsync({
      action: () => getSubscribers(token, inscriptionSelected!.id!),
      loadingMessage: "Exportando lista de alunos...",
      successMessage: "Lista de alunos exportada com sucesso!",
      errorMessage: "Erro ao exportar lista de alunos",
      onSuccess: (data) => {
        const flattenedData = flattenData(data);

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
      },
    });
  };

  const clipboard = () => {
    const linkPrepCourse = `${
      import.meta.env.VITE_APP_BASE_URL
    }/cursinho/inscricao/${inscriptionSelected!.id}`;
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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{dataInscription.inscription}</DialogTitle>
        </DialogHeader>
        <h3 className="font-extrabold text-h2 text-foreground break-words">
          {inscriptionSelected?.name}
        </h3>
        <p className="break-words whitespace-pre-line max-h-40 overflow-y-auto pr-1">
          {inscriptionSelected?.description}
        </p>
        <h3 className="font-extrabold text-h2 text-foreground">Data</h3>
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
        <h3 className="font-extrabold text-h2 text-foreground">
          {dataInscription.openingText}
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <p>
              <strong>Incritos:</strong> {inscriptionSelected?.subscribersCount}
            </p>
            <p>
              <strong>Vagas:</strong> {inscriptionSelected?.openingsCount}
            </p>
          </div>
          <div className="sm:col-span-2 flex flex-col gap-3 py-2 px-3 rounded-md bg-page">
            <div className="flex items-start gap-2">
              {inscriptionSelected?.requestDocuments ? (
                <>
                  <FileText className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-body text-foreground">
                    Este processo seletivo <strong>exigirá</strong> envio de
                    documentos dos candidatos.
                  </span>
                </>
              ) : (
                <>
                  <FileX className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-body text-foreground">
                    Este processo seletivo <strong>não exigirá</strong> envio de
                    documentos dos candidatos.
                  </span>
                </>
              )}
            </div>
            {inscriptionSelected?.isTest && (
              <div className="flex items-start gap-2">
                <FlaskConical className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <span className="text-body text-foreground">
                  Este processo está marcado como <strong>teste</strong> e não
                  deve ser considerado válido para uso real.
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          className="flex gap-1.5 items-center justify-end"
          onClick={clipboard}
        >
          <p className="font-medium">Link de inscrição</p>
          <Copy size="1em" aria-hidden="true" />
        </button>
        {ModalEdit()}
        {ModalDelete()}
        {ModalExtend()}

        <DialogFooter className="flex-col sm:flex-col sm:items-stretch">
          {/*
            Celular: um botão por linha, na ordem de uso (lista, baixar, editar)
            e o destrutivo por último. A partir de sm volta à linha única.
          */}
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="order-2 sm:order-1">
              <ShadcnTooltip content="Download Lista de Alunos">
                <Button
                  variant="cta"
                  aria-label="Baixar lista de alunos"
                  className="h-10 sm:h-8 w-full sm:w-auto"
                  onClick={() => exportToExcel()}
                >
                  <Download className="w-6 h-6" />
                  <span className="sm:hidden">Baixar lista de alunos</span>
                </Button>
              </ShadcnTooltip>
            </div>
            <div className="order-1 sm:order-2 w-full sm:w-36">
              <BLink
                className="h-10 sm:h-8 w-full bg-success border-none hover:bg-success/60"
                to={`${DASH}/${PARTNER_PREP_INSCRIPTION}/${inscriptionSelected?.id}`}
              >
                <div className="flex justify-center gap-1.5">
                  <p className="text-body w-fit">Lista de Alunos</p>
                </div>
              </BLink>
            </div>
            <div className="order-3 flex flex-col-reverse gap-3 sm:flex-row sm:flex-1 sm:justify-end sm:gap-4">
              <Button variant="destructive" size="lg"
                className="w-full sm:w-24 h-10 sm:h-8"
                disabled={inscriptionSelected!.subscribersCount > 0}
                onClick={() => setOpenModalDelete(true)}
              >
                <div className="flex justify-center gap-1.5">
                  <TrashIcon />
                  <p className="text-body w-fit">Deletar</p>
                </div>
              </Button>

              {canExtend === true ? (
                <Button variant="outline" size="lg"
                  className="w-full sm:w-32 h-10 sm:h-8"
                  onClick={() => setOpenModalExtend(true)}
                >
                  Prorrogar
                </Button>
              ) : (
                <Button variant="outline" size="lg"
                  className="w-full sm:w-24 h-10 sm:h-8"
                  onClick={() => setOpenModalEdit(true)}
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
