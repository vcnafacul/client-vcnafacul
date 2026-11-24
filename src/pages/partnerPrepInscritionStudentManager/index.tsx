import { PageHeader, PageShell } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Bool } from "@/enums/bool";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { toast } from "@/lib/toast";
import { getRuleSetByInscription } from "@/services/partnerPrepForm/getRuleSetByInscription";
import { getInscription } from "@/services/prepCourse/getInscription";
import { getHistoricoInscrito } from "@/services/prepCourse/inscription/getHistoricoInscrito";
import { getSubscribers } from "@/services/prepCourse/inscription/getSubscribers";
import { updateWaitingListInfo } from "@/services/prepCourse/inscription/updateWaitingList";
import { confirmEnrolled } from "@/services/prepCourse/student/confirmEnrolled";
import { rejectStudent } from "@/services/prepCourse/student/rejectStudent";
import { resetStudent } from "@/services/prepCourse/student/resetStudent";
import { scheduleEnrolled } from "@/services/prepCourse/student/scheduleEnrolled";
import { sendEmailDeclarationInterest } from "@/services/prepCourse/student/sendEmailDeclarationInterest";
import { updateSelectEnrolledInfo } from "@/services/prepCourse/student/updateEnrolledInfo";
import { updateIsFreeInfo } from "@/services/prepCourse/student/updateIsFreeInfo";
import { useAuthStore } from "@/store/auth";
import { useDadosSensiveis } from "@/hooks/useDadosSensiveis";
import { Switch } from "@/components/ui/switch";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { RankingItem } from "@/types/partnerPrepForm/ruleForm";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/ui/data-table";
import { ordenarLinhas } from "@/lib/ordenarLinhas";
import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Mail, MailMinus, MailPlus, RefreshCw, Timer, TimerOff, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { ReactComponent as IsentoIcon } from "../../assets/icons/partnerPrepCourse/pagante_add_dk.svg";
import { ReactComponent as PaganteIcon } from "../../assets/icons/partnerPrepCourse/pagante_remover_dk.svg";
import { ReactComponent as Reset } from "../../assets/icons/partnerPrepCourse/reset_dk.svg";
import { UpdateStudentClassModal } from "../studentsEnrolled/modals/updateStudentClassModal";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { ActionButton } from "./actionsButton";
import { ListaDeInscritosMobile } from "./ListaDeInscritosMobile";
import { Details } from "./modal/details";
import { Statistic } from "./modal/statistic";
import { ScheduleCallEnrolle } from "./scheduleCallEnrolled";
import { TableInfo } from "./tableInfo";
import { ModalRules } from "./modal/modalRules";
import { WaitingList } from "./waitingList";

/** Pede o texto antes de agir: tem campo, então é Dialog (tickets/059 D21). */
function ModalMotivoIndeferimento({
  titulo,
  onConfirm,
  onClose,
}: {
  titulo: string;
  onConfirm: (texto: string) => void;
  onClose: () => void;
}) {
  const [texto, setTexto] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      size="sm"
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <Field label="Motivo do indeferimento" required>
          <Textarea
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            className="resize-none"
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!texto}
            onClick={() => onConfirm(texto)}
          >
            Indeferir matrícula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PartnerPrepInscritionStudentManager() {
  const { inscriptionId } = useParams();
  const [students, setStudents] = useState<XLSXStudentCourseFull[]>([]);
  const [inscriptionInfo, setInscriptionInfo] = useState<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    expectedOpening: number;
  } | null>(null);
  const [studentSelected, setStudentSelected] = useState<
    XLSXStudentCourseFull | undefined
  >(undefined);
  const [ranking, setRanking] = useState<RankingItem[] | null>(null);

  const rankingMap = useMemo(() => {
    if (!ranking) return null;
    const map = new Map<string, number>();
    ranking.forEach((item) => map.set(item.userId, item.rank));
    return map;
  }, [ranking]);

  const sortedStudents = useMemo(() => {
    if (!rankingMap) return students;
    return [...students].sort((a, b) => {
      const rankA = rankingMap.get(a.userId) ?? Infinity;
      const rankB = rankingMap.get(b.userId) ?? Infinity;
      return rankA - rankB;
    });
  }, [students, rankingMap]);

  // Gerenciamento de modais com hook customizado
  const modals = useModals([
    "waitingList",
    "scheduleEnrolled",
    "details",
    "statistic",
    "reject",
    "selectClass",
    "rules",
  ]);

  const {
    data: { token },
  } = useAuthStore();
  // A rota já exige gerenciarProcessoSeletivo: quem chega aqui vê o dado completo.
  const { ocultar, setOcultar, mascarar } = useDadosSensiveis(true);

  const executeAsync = useToastAsync();
  // Abaixo de 768px (o `sm` do projeto) a tabela vira lista de cards.
  const acimaDeSm = useAcimaDeSm();

  const handleIsFreeInfo = async (studentId: string, isFree: boolean) => {
    await executeAsync({
      action: () => updateIsFreeInfo(studentId, isFree, token),
      loadingMessage: "Atualizando informações...",
      successMessage: "Informações atualizadas com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentId) {
            return { ...stu, isento: isFree ? Bool.Yes : Bool.No };
          }
          return stu;
        });
        setStudents(newStudent);
      },
    });
  };

  const handleWaitingList = async (studentId: string, insert: boolean) => {
    await executeAsync({
      action: () =>
        updateWaitingListInfo(inscriptionId!, studentId, insert, token),
      loadingMessage: `${
        !insert ? "Removendo da" : "Inserindo na"
      } lista de espera ...`,
      successMessage: "Lista de espera atualizada",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentId) {
            return {
              ...stu,
              lista_de_espera: insert ? Bool.Yes : Bool.No,
              convocar: insert ? Bool.No : stu.convocar,
            };
          }
          return stu;
        });
        setStudents(newStudent);
      },
    });
  };

  const handleSelectEnrolledInfo = async (
    studentId: string,
    selected: boolean,
  ) => {
    await executeAsync({
      action: () => updateSelectEnrolledInfo(studentId, selected, token),
      loadingMessage: `${
        !selected ? "Removendo da" : "Inserindo na"
      } lista de convocação ...`,
      successMessage: "Lista de convocação atualizada",
      errorMessage: "Erro ao atualizar lista de convocação",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentId) {
            return {
              ...stu,
              convocar: selected ? Bool.Yes : Bool.No,
              lista_de_espera: Bool.No,
              status: StatusApplication.UnderReview,
              data_convocacao: null,
              data_limite_convocacao: null,
            };
          }
          return stu;
        });
        setStudents(newStudent);
      },
    });
  };

  const handleResetStudent = async (studentId: string) => {
    await executeAsync({
      action: () => resetStudent(studentId, token),
      loadingMessage: "Resetando Informações...",
      successMessage: "Informações resetadas com sucesso!",
      errorMessage: "Erro ao resetar informações",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentId) {
            return {
              ...stu,
              convocar: Bool.No,
              lista_de_espera: Bool.No,
              status: StatusApplication.UnderReview,
              data_convocacao: null,
              data_limite_convocacao: null,
            };
          }
          return stu;
        });
        setStudents(newStudent);
      },
    });
  };

  const handleScheduleEnrolled = async (datas: Date[]) => {
    await executeAsync({
      action: () => scheduleEnrolled(inscriptionId!, datas[0], datas[1], token),
      loadingMessage: "Programando Convocação",
      successMessage: "Convocação programada com sucesso!",
      errorMessage: "Erro ao programar convocação",
      onSuccess: () => {
        subscribers();
        modals.scheduleEnrolled.close();
      },
    });
  };

  const handleOpenSelectClassModal = (studentId: string) => {
    const student = students.find((stu) => stu.id === studentId);
    setStudentSelected(student);
    modals.selectClass.open();
  };

  const handleConfirmEnrolled = async (classId: string, className: string) => {
    if (!studentSelected) return;

    const toastId = toast.loading("Confirmando Matrícula...");
    try {
      await confirmEnrolled(studentSelected.id, classId, token);
      toast.update(toastId, {
        render: `Matrícula confirmada com sucesso na turma ${className}!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      const newStudents = students.map((stu) =>
        stu.id === studentSelected.id
          ? { ...stu, status: StatusApplication.Enrolled }
          : stu
      );
      setStudents(newStudents);
      modals.selectClass.close();
    } catch (error: unknown) {
      if ((error as Error & { isTestPS?: boolean }).isTestPS) {
        toast.update(toastId, {
          render: "Processo Seletivo de Teste: Não é possível matricular estudantes",
          type: "default",
          theme: "dark",
          isLoading: false,
          autoClose: 5000,
          closeOnClick: true,
        });
      } else {
        toast.update(toastId, {
          render: `Erro ao confirmar matrícula: ${(error as Error).message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeOnClick: true,
        });
      }
    }
  };

  const handleSendEmailDeclaredInterest = async (studentId: string) => {
    await executeAsync({
      action: () => sendEmailDeclarationInterest(studentId, token),
      loadingMessage: "Enviando Email...",
      successMessage: "Email enviado com sucesso!",
      errorMessage: "Erro ao enviar email",
    });
  };

  function shouldProcessApplication(
    status: StatusApplication,
    startDate: Date | null,
    custonsStatusReject?: StatusApplication[],
  ): boolean {
    const listStatus = custonsStatusReject || [
      StatusApplication.Enrolled,
      StatusApplication.DeclaredInterest,
      StatusApplication.EnrollmentCancelled,
      StatusApplication.Rejected,
      StatusApplication.MissedDeadline,
      StatusApplication.EnrollmentNotConfirmed,
    ];
    const currentDate = new Date();
    if (
      status === StatusApplication.CalledForEnrollment &&
      startDate &&
      currentDate >= startDate
    ) {
      return false;
    }

    if (listStatus.includes(status)) {
      return false;
    }

    return true;
  }

  const handleIndeferir = async (studentId: string, reason: string) => {
    await executeAsync({
      action: () => rejectStudent(studentId, reason, token),
      loadingMessage: "Indefirindo Matrícula...",
      successMessage: "Matrícula indeferida com sucesso!",
      errorMessage: "Erro ao indeferir matrícula",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentId) {
            return {
              ...stu,
              status: StatusApplication.Rejected,
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.reject.close();
      },
    });
  };

  const ModalReject = () => {
    return !modals.reject.isOpen ? null : (
      <ModalMotivoIndeferimento
        titulo={`Por favor, informe o motivo do indeferimento da matrícula de ${capitalizeWords(
          studentSelected?.nome + " " + studentSelected?.sobrenome,
        )}.`}
        onClose={modals.reject.close}
        onConfirm={(motivo) => handleIndeferir(studentSelected!.id, motivo)}
      />
    );
  };

  // Logs e documentos não vêm na lista (pesavam a consulta): busca ao abrir.
  const handleModalDetaild = async (id: string) => {
    const student = students.find((student) => student.id === id);
    if (!student) return;
    await executeAsync({
      action: () => getHistoricoInscrito(inscriptionId!, id, token),
      loadingMessage: "Carregando detalhes...",
      errorMessage: "Erro ao carregar documentos e histórico do aluno",
      onSuccess: (historico) => {
        setStudentSelected({ ...student, ...historico });
        modals.details.open();
      },
    });
  };

  /*
    As ações de um inscrito. Mesma função na coluna da DataTable (desktop) e no
    card da lista do celular, para as duas nunca divergirem.
  */
  const renderAcoes = (row: XLSXStudentCourseFull) => (
    <div className="flex justify-center items-center gap-2 h-8 flex-wrap">
      <TooltipProvider><Tooltip><TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Visualizar"
          onClick={() => handleModalDetaild(row.id)}
        >
          <Eye className="h-6 w-6 text-muted-foreground opacity-60 hover:opacity-100" />
        </Button>
      </TooltipTrigger><TooltipContent>Visualizar</TooltipContent></Tooltip></TooltipProvider>
      {row.isento === "Sim" &&
        shouldProcessApplication(
          row.status,
          row.data_convocacao,
        ) && (
          <ActionButton
            titleAlert="Tem certeza que deseja torna esse aluno pagante?"
            actionLabel="Tornar pagante"
            onConfirm={() => handleIsFreeInfo(row.id, false)}
            tooltipTitle="Tornar Pagante"
          >
            <IsentoIcon className="h-6 w-6 fill-success opacity-60 hover:opacity-100" />
          </ActionButton>
        )}
      {row.isento === "Não" &&
        shouldProcessApplication(
          row.status,
          row.data_convocacao,
        ) && (
          <ActionButton
            titleAlert="Tem certeza que deseja torna esse aluno isento?"
            actionLabel="Dar isenção"
            onConfirm={() => handleIsFreeInfo(row.id, true)}
            tooltipTitle="Dar Isenção"
          >
            <PaganteIcon className="h-6 w-6 fill-destructive opacity-60 hover:opacity-100" />
          </ActionButton>
        )}
      {shouldProcessApplication(
        row.status,
        row.data_convocacao,
      ) && (
        <ActionButton
          titleAlert={`Confirme a ${
            row.convocar === Bool.No ? "adição" : "remoção"
          } de ${row.nome} ${
            row.sobrenome
          } da lista de convocação`}
          actionLabel={
            row.convocar === Bool.No
              ? "Adicionar à convocação"
              : "Remover da convocação"
          }
          variant={row.convocar === Bool.No ? "primary" : "destructive"}
          onConfirm={() =>
            handleSelectEnrolledInfo(
              row.id,
              row.convocar === Bool.No,
            )
          }
          tooltipTitle={`${
            row.convocar === Bool.No ? "Add" : "Remover"
          } da lista de convocação`}
        >
          {row.convocar === Bool.No ? (
            <MailPlus className="h-6 w-6 text-success opacity-60 hover:opacity-100" />
          ) : (
            <MailMinus className="h-6 w-6 text-destructive opacity-60 hover:opacity-100" />
          )}
        </ActionButton>
      )}
      {shouldProcessApplication(
        row.status,
        row.data_convocacao,
      ) && (
        <ActionButton
          titleAlert={`${
            row.lista_de_espera === Bool.Yes
              ? "Remover"
              : "Adicionar"
          } Lista de espera`}
          descriptionAlert={`Confirme a  ${
            row.lista_de_espera === Bool.No ? "adição" : "remoção"
          } de ${row.nome} ${
            row.sobrenome
          } da lista de espera`}
          actionLabel={
            row.lista_de_espera === Bool.No
              ? "Adicionar à lista de espera"
              : "Remover da lista de espera"
          }
          variant={
            row.lista_de_espera === Bool.No ? "primary" : "destructive"
          }
          onConfirm={() =>
            handleWaitingList(
              row.id,
              row.lista_de_espera === Bool.No,
            )
          }
          tooltipTitle={`${
            row.lista_de_espera === Bool.No ? "Add" : "Remover"
          } da lista de espera`}
        >
          {row.lista_de_espera === Bool.No ? (
            <Timer className="h-6 w-6 text-primary opacity-60 hover:opacity-100" />
          ) : (
            <TimerOff className="h-6 w-6 text-warning opacity-60 hover:opacity-100" />
          )}
        </ActionButton>
      )}
      {row.status === StatusApplication.DeclaredInterest && (
        <TooltipProvider><Tooltip><TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Confirmação de Matrícula"
            onClick={() => handleOpenSelectClassModal(row.id)}
          >
            <Check className="h-6 w-6 text-success opacity-60 hover:opacity-100" />
          </Button>
        </TooltipTrigger><TooltipContent>Confirmação de Matrícula</TooltipContent></Tooltip></TooltipProvider>
      )}
      {(row.status === StatusApplication.DeclaredInterest ||
        row.status === StatusApplication.MissedDeadline ||
        row.status === StatusApplication.UnderReview) && (
        <TooltipProvider><Tooltip><TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Indeferir"
            onClick={() => {
              setStudentSelected(
                students.find((student) => student.id === row.id)!,
              );
              modals.reject.open();
            }}
          >
            <X className="h-6 w-6 text-destructive/60 hover:text-destructive" />
          </Button>
        </TooltipTrigger><TooltipContent>Indeferir</TooltipContent></Tooltip></TooltipProvider>
      )}
      {shouldProcessApplication(
        row.status,
        row.data_convocacao,
        [StatusApplication.Enrolled, StatusApplication.DeclaredInterest],
      ) && (
        <ActionButton
          titleAlert="Deseja resetar as informações do aluno?"
          actionLabel="Resetar aluno"
          variant="destructive"
          onConfirm={() => handleResetStudent(row.id)}
          tooltipTitle="Resetar"
        >
          <Reset className="h-6 w-6 fill-destructive/70 hover:fill-destructive" />
        </ActionButton>
      )}
      {row.status === StatusApplication.CalledForEnrollment &&
        !row.sended_email_recently &&
        row.data_convocacao &&
        new Date() >= row.data_convocacao && (
          <ActionButton
            titleAlert={`Confirmação de Matrícula ${row.nome} ${row.sobrenome}`}
            descriptionAlert={`Realizar a  confirmação de matrícula de  ${row.nome} ${row.sobrenome}`}
            actionLabel="Reenviar email"
            onConfirm={() => {
              handleSendEmailDeclaredInterest(row.id);
            }}
            tooltipTitle="Reenviar email de convocação"
          >
            <Mail className="h-6 w-6 text-info opacity-60 hover:opacity-100" />
          </ActionButton>
        )}
    </div>
  );

  const dia = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "";

  const columns: DataTableColumn<XLSXStudentCourseFull>[] = [
    {
      id: "actions",
      header: "Ações",
      align: "center",
      width: "320px",
      cell: (row) => renderAcoes(row),
    },
    {
      id: "rankPosition",
      header: (
        <span title="Posição no Ranking">Pos.</span>
      ),
      align: "center",
      sortable: true,
      width: "70px",
      cell: (row) => {
        if (!rankingMap) return "—";
        const rank = rankingMap.get(row.userId);
        return rank != null ? `${rank}º` : "—";
      },
    },
    {
      id: "email",
      header: "Email",
      sortable: true,
      width: "250px",
      cell: (row) => mascarar.email(row.email),
    },
    {
      id: "cpf",
      header: "CPF",
      sortable: true,
      cell: (row) => mascarar.cpf(row.cpf),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      width: "200px",
      cell: (row) => row.status,
    },
    {
      id: "isento",
      header: "Isento",
      align: "center",
      sortable: true,
      cell: (row) => row.isento,
    },
    {
      id: "lista_de_espera",
      header: <span title="Lista de Espera">L. Espera</span>,
      align: "center",
      sortable: true,
      cell: (row) => row.lista_de_espera,
    },
    {
      id: "convocar",
      header: <span title="Lista de Convocação">L. Convoc</span>,
      align: "center",
      sortable: true,
      cell: (row) => row.convocar,
    },
    {
      id: "data_convocacao",
      header: <span title="Data de Convocação para Matrícula">Data Conv</span>,
      sortable: true,
      cell: (row) => dia(row.data_convocacao),
    },
    {
      id: "data_limite_convocacao",
      header: <span title="Prazo Confirmação Matrícula">Prazo M.</span>,
      sortable: true,
      cell: (row) => dia(row.data_limite_convocacao),
    },
    { id: "nome", header: "Nome", sortable: true, cell: (row) => row.nome },
    {
      id: "sobrenome",
      header: "Sobrenome",
      sortable: true,
      cell: (row) => row.sobrenome,
    },
  ];

  // A ordem inicial é a do ranking (`sortedStudents`); o cabeçalho reordena por cima.
  const [sort, setSort] = useState<DataTableSort | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const linhas = useMemo(
    () =>
      ordenarLinhas(sortedStudents, sort, {
        rankPosition: (r) => rankingMap?.get(r.userId),
        email: (r) => r.email,
        cpf: (r) => r.cpf,
        status: (r) => r.status,
        isento: (r) => r.isento,
        lista_de_espera: (r) => r.lista_de_espera,
        convocar: (r) => r.convocar,
        data_convocacao: (r) =>
          r.data_convocacao ? new Date(r.data_convocacao).getTime() : null,
        data_limite_convocacao: (r) =>
          r.data_limite_convocacao
            ? new Date(r.data_limite_convocacao).getTime()
            : null,
        nome: (r) => r.nome,
        sobrenome: (r) => r.sobrenome,
      }),
    [sortedStudents, sort, rankingMap],
  );

  const ModalWaitingList = () => {
    return modals.waitingList.isOpen ? (
      <WaitingList
        isOpen={modals.waitingList.isOpen}
        handleClose={modals.waitingList.close}
        inscriptionId={inscriptionId!}
      />
    ) : null;
  };

  const ScheduleEnrolled = () => {
    return modals.scheduleEnrolled.isOpen ? (
      <ScheduleCallEnrolle
        isOpen={modals.scheduleEnrolled.isOpen}
        handleClose={modals.scheduleEnrolled.close}
        handleScheduleEnrolled={handleScheduleEnrolled}
      />
    ) : null;
  };

  const ModalDetails = () => {
    return modals.details.isOpen ? (
      <Details
        handleClose={modals.details.close}
        student={studentSelected!}
        mascarar={mascarar}
      />
    ) : null;
  };

  const ModalStatistic = () => {
    return modals.statistic.isOpen ? (
      <Statistic
        handleClose={modals.statistic.close}
        geral={{
          forms: students.map((student) => student.socioeconomic),
          isFree: students.map((student) => student.isento === Bool.Yes),
        }}
        enrolleds={{
          forms: students
            .filter((student) => student.status === StatusApplication.Enrolled)
            .map((student) => student.socioeconomic),
          isFree: students
            .filter((student) => student.status === StatusApplication.Enrolled)
            .map((student) => student.isento === Bool.Yes),
        }}
      />
    ) : null;
  };

  const ModalSelectClass = () => {
    return modals.selectClass.isOpen ? (
      <UpdateStudentClassModal
        isOpen={modals.selectClass.isOpen}
        handleClose={modals.selectClass.close}
        handleConfirm={(classId, className) =>
          handleConfirmEnrolled(classId, className)
        }
      />
    ) : null;
  };

  const subscribers = async () => {
    if (!inscriptionId) return;
    await executeAsync({
      action: () => getSubscribers(token, inscriptionId!),
      loadingMessage: "Carregando Lista de Alunos...",
      successMessage: "Lista de alunos carregada com sucesso!",
      errorMessage: "Erro ao carregar lista de alunos",
      onSuccess: (data: XLSXStudentCourseFull[]) => {
        setStudents(
          data.map((student) => {
            return {
              ...student,
              nome: student.usar_nome_social
                ? student.nome_social
                : student.nome,
            };
          }),
        );
        setStudentSelected(data[0]);
      },
    });
  };

  useEffect(() => {
    subscribers();
    if (inscriptionId) {
      getInscription(inscriptionId, token)
        .then((res) => setInscriptionInfo(res.inscription))
        .catch(() => {});
      getRuleSetByInscription(inscriptionId, token)
        .then((res) => {
          if (res.lastRanking) setRanking(res.lastRanking);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell>
      <PageHeader
        title={inscriptionInfo?.name || "Gerenciamento de Inscritos"}
        subtitle={
          inscriptionInfo
            ? `Período: ${new Date(inscriptionInfo.startDate).toLocaleDateString("pt-BR")} — ${new Date(inscriptionInfo.endDate).toLocaleDateString("pt-BR")} · ${inscriptionInfo.expectedOpening} vagas · ${students.length} inscritos`
            : undefined
        }
        actions={
          <>
            <Button variant="outline" onClick={modals.statistic.open}>
              Estatisticas
            </Button>
            <Button variant="outline" onClick={modals.waitingList.open}>
              Lista de Espera
            </Button>
            <Button variant="outline" onClick={modals.scheduleEnrolled.open}>
              Programar Convocação
            </Button>
            <Button variant="outline" onClick={modals.rules.open}>
              Regras de Pontuação
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Atualizar lista"
              onClick={() => subscribers()}
            >
              <RefreshCw aria-hidden="true" />
            </Button>
          </>
        }
      >
        {inscriptionInfo?.description && (
          <p className="break-words border-b border-border px-4 py-3 text-body text-muted-foreground">
            {inscriptionInfo.description}
          </p>
        )}
      </PageHeader>
      <TableInfo students={students} />
      <div className="flex justify-end">
        <Switch
          checked={ocultar}
          onCheckedChange={setOcultar}
          label="Ocultar dados sensíveis"
        />
      </div>
      {!acimaDeSm ? (
        <ListaDeInscritosMobile
          inscritos={sortedStudents}
          rankingMap={rankingMap}
          renderAcoes={renderAcoes}
          mascarar={mascarar}
        />
      ) : (
        // Muitas colunas: a largura mínima faz o cartão rolar na horizontal, como a grade rolava.
        <Card className="h-full w-full overflow-x-auto">
          <DataTable
            aria-label="Inscritos do processo seletivo"
            columns={columns}
            rows={linhas}
            getRowId={(row) => row.id}
            sort={sort}
            onSortChange={setSort}
            density="compact"
            className="min-w-[1400px] rounded-none border-0"
            pagination={{
              page,
              pageSize,
              total: linhas.length,
              onPageChange: setPage,
              pageSizeOptions: [5, 10, 15, 30, 50, 100],
              onPageSizeChange: (n) => {
                setPageSize(n);
                setPage(1);
              },
            }}
          />
        </Card>
      )}
      {ModalWaitingList()}
      {ScheduleEnrolled()}
      {ModalDetails()}
      {ModalStatistic()}
      {ModalReject()}
      {ModalSelectClass()}
      {modals.rules.isOpen && (
        <ModalRules
          isOpen={modals.rules.isOpen}
          handleClose={modals.rules.close}
          inscriptionId={inscriptionId!}
          students={students}
          onRankingUpdate={setRanking}
        />
      )}
    </PageShell>
  );
}
