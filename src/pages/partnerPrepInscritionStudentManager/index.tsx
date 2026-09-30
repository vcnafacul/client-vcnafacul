import Button from "@/components/molecules/button";
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import { Bool } from "@/enums/bool";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { toast } from "react-toastify";
import { getRuleSetByInscription } from "@/services/partnerPrepForm/getRuleSetByInscription";
import { getInscription } from "@/services/prepCourse/getInscription";
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
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { RankingItem } from "@/types/partnerPrepForm/ruleForm";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BsEnvelopeArrowDownFill, BsEnvelopeArrowUpFill } from "react-icons/bs";
import { FaCheck, FaSyncAlt } from "react-icons/fa";
import { IoClose, IoEyeSharp } from "react-icons/io5";
import { MdEmail, MdTimerOff } from "react-icons/md";
import { PiTimerFill } from "react-icons/pi";
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

  const executeAsync = useToastAsync();
  // Abaixo de 768px (o `sm` do projeto) a tabela vira lista de cards.
  const acimaDeSm = useAcimaDeSm();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChange = useCallback((selectionModel: any) => {
    setSelectedRows(selectionModel);
  }, []);

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
      <ModalConfirmCancelMessage
        isOpen={modals.reject.isOpen}
        handleClose={modals.reject.close}
        handleConfirm={(message) =>
          handleIndeferir(studentSelected!.id, message!)
        }
        text={`Por favor, informe o motivo do indeferimento da matrícula de ${capitalizeWords(
          studentSelected?.nome + " " + studentSelected?.sobrenome,
        )}.`}
        className="bg-white p-4 rounded-md w-full max-w-[512px]"
      />
    );
  };

  const handleModalDetaild = (id: string) => {
    const student = students.find((student) => student.id === id);
    setStudentSelected(student!);
    modals.details.open();
  };

  /*
    As ações de um inscrito. Mesma função na coluna do DataGrid (desktop) e no
    card da lista do celular, para as duas nunca divergirem.
  */
  const renderAcoes = (row: XLSXStudentCourseFull) => (
    <div className="flex justify-center items-center gap-2 h-8 flex-wrap">
      <Tooltip title="Visualizar">
        <IconButton onClick={() => handleModalDetaild(row.id)}>
          <IoEyeSharp className="h-6 w-6 fill-gray-500 opacity-60 hover:opacity-100" />
        </IconButton>
      </Tooltip>
      {row.isento === "Sim" &&
        shouldProcessApplication(
          row.status,
          row.data_convocacao,
        ) && (
          <ActionButton
            titleAlert="Tem certeza que deseja torna esse aluno pagante?"
            onConfirm={() => handleIsFreeInfo(row.id, false)}
            tooltipTitle="Tornar Pagante"
          >
            <IsentoIcon className="h-6 w-6 fill-darkGreen opacity-60 hover:opacity-100" />
          </ActionButton>
        )}
      {row.isento === "Não" &&
        shouldProcessApplication(
          row.status,
          row.data_convocacao,
        ) && (
          <ActionButton
            titleAlert="Tem certeza que deseja torna esse aluno isento?"
            onConfirm={() => handleIsFreeInfo(row.id, true)}
            tooltipTitle="Dar Isenção"
          >
            <PaganteIcon className="h-6 w-6 fill-redError opacity-60 hover:opacity-100" />
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
            <BsEnvelopeArrowUpFill className="h-6 w-6 fill-lime-600 opacity-60 hover:opacity-100" />
          ) : (
            <BsEnvelopeArrowDownFill className="h-6 w-6 fill-red opacity-60 hover:opacity-100" />
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
            <PiTimerFill className="h-6 w-6 fill-marine opacity-60 hover:opacity-100" />
          ) : (
            <MdTimerOff className="h-6 w-6 fill-orange opacity-60 hover:opacity-100" />
          )}
        </ActionButton>
      )}
      {row.status === StatusApplication.DeclaredInterest && (
        <Tooltip title="Confirmação de Matrícula">
          <IconButton
            onClick={() => handleOpenSelectClassModal(row.id)}
          >
            <FaCheck className="h-6 w-6 fill-green3 opacity-60 hover:opacity-100" />
          </IconButton>
        </Tooltip>
      )}
      {(row.status === StatusApplication.DeclaredInterest ||
        row.status === StatusApplication.MissedDeadline ||
        row.status === StatusApplication.UnderReview) && (
        <Tooltip title="Indeferir">
          <IconButton>
            <IoClose
              onClick={() => {
                setStudentSelected(
                  students.find((student) => student.id === row.id)!,
                );
                modals.reject.open();
              }}
              className="h-6 w-6 fill-redError/60 hover:fill-redError cursor-pointer"
            />
          </IconButton>
        </Tooltip>
      )}
      {shouldProcessApplication(
        row.status,
        row.data_convocacao,
        [StatusApplication.Enrolled, StatusApplication.DeclaredInterest],
      ) && (
        <ActionButton
          titleAlert="Deseja resetar as informações do aluno?"
          onConfirm={() => handleResetStudent(row.id)}
          tooltipTitle="Resetar"
        >
          <Reset className="h-6 w-6 fill-red/70 hover:fill-red" />
        </ActionButton>
      )}
      {row.status === StatusApplication.CalledForEnrollment &&
        !row.sended_email_recently &&
        row.data_convocacao &&
        new Date() >= row.data_convocacao && (
          <ActionButton
            titleAlert={`Confirmação de Matrícula ${row.nome} ${row.sobrenome}`}
            descriptionAlert={`Realizar a  confirmação de matrícula de  ${row.nome} ${row.sobrenome}`}
            onConfirm={() => {
              handleSendEmailDeclaredInterest(row.id);
            }}
            tooltipTitle="Reenviar email de convocação"
          >
            <MdEmail className="h-6 w-6 fill-sky-500 opacity-60 hover:opacity-100" />
          </ActionButton>
        )}
    </div>
  );

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      minWidth: 300,
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      renderCell: (params) => renderAcoes(params.row),
    },
    {
      field: "rankPosition",
      headerName: "Pos.",
      description: "Posição no Ranking",
      width: 70,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (!rankingMap) return "—";
        const rank = rankingMap.get(params.row.userId);
        return rank != null ? `${rank}º` : "—";
      },
    },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "cpf",
      headerName: "CPF",
      flex: 1,
      minWidth: 120,
    },
    { field: "status", headerName: "Status", width: 200 },
    {
      field: "isento",
      headerName: "Isento",
      flex: 1,
      display: "flex",
      align: "center",
    },
    {
      field: "lista_de_espera",
      headerName: "L. Espera",
      description: "Lista de Espera",
      flex: 1,
      display: "text",
      align: "center",
    },
    {
      field: "convocar",
      headerName: "L. Convoc",
      description: "Lista de Convocação",
      flex: 1,
      display: "flex",
      align: "center",
      filterable: false,
    },
    {
      field: "data_convocacao",
      headerName: "Data Conv",
      description: "Data de Convocação para Matrícula",
      flex: 1,
      type: "date",
    },
    {
      field: "data_limite_convocacao",
      headerName: "Prazo M.",
      description: "Prazo Confirmação Matrícula",
      flex: 1,
      type: "date",
    },

    { field: "nome", headerName: "Nome", flex: 1 },
    { field: "sobrenome", headerName: "Sobrenome", flex: 1 },
  ];
  const paginationModel = { page: 0, pageSize: 10 };

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
      <Details handleClose={modals.details.close} student={studentSelected!} />
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
    <div className="flex flex-col justify-center items-center pt-4">
      <div className="w-full px-4">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-center text-marine break-words">
            {inscriptionInfo?.name || "Gerenciamento de Inscritos"}
          </h1>
          {inscriptionInfo?.description && (
            <p className="text-sm text-gray-500 text-center mt-1 break-words">
              {inscriptionInfo.description}
            </p>
          )}
          {inscriptionInfo && (
            <p className="text-xs text-gray-400 text-center mt-1">
              Período:{" "}
              {new Date(inscriptionInfo.startDate).toLocaleDateString("pt-BR")}{" "}
              — {new Date(inscriptionInfo.endDate).toLocaleDateString("pt-BR")}{" "}
              · {inscriptionInfo.expectedOpening} vagas · {students.length}{" "}
              inscritos
            </p>
          )}
        </div>
        <div className="h-full w-full flex pb-2 flex-col md:flex-row gap-2 md:gap-0">
          <TableInfo students={students} />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center md:gap-1 md:items-end md:justify-end md:flex-1">
            <Button
              size="small"
              className="border-none w-full h-10 sm:w-fit sm:h-fit"
              typeStyle="refused"
              onClick={modals.statistic.open}
            >
              <p className="text-sm">Estatisticas</p>
            </Button>
            <Button
              size="small"
              className="border-none w-full h-10 sm:w-fit sm:h-fit"
              onClick={modals.waitingList.open}
            >
              <p className="text-sm">Lista de Espera</p>
            </Button>
            <Button
              size="small"
              typeStyle="accepted"
              className="border-none w-full h-10 sm:w-fit sm:h-fit"
              onClick={modals.scheduleEnrolled.open}
            >
              <p className="text-sm">Programar Convocação</p>
            </Button>
            <Button
              size="small"
              className="border-none w-full h-10 sm:w-fit sm:h-fit"
              onClick={modals.rules.open}
            >
              <p className="text-sm">Regras de Pontuação</p>
            </Button>
            <button
              type="button"
              aria-label="Atualizar lista"
              onClick={() => subscribers()}
              className="col-span-2 flex items-center justify-center gap-2 h-10 border border-gray-300 rounded-md text-sm text-gray-600 sm:h-auto sm:border-0 sm:col-span-1"
            >
              <FaSyncAlt className="h-7 w-7 p-0.5 fill-gray-500 hover:fill-marine hover:animate-rotate5" />
              {!acimaDeSm && "Atualizar lista"}
            </button>
          </div>
        </div>
      </div>
      {!acimaDeSm ? (
        <ListaDeInscritosMobile
          inscritos={sortedStudents}
          rankingMap={rankingMap}
          renderAcoes={renderAcoes}
        />
      ) : (
        <Paper sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={sortedStudents}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            // checkboxSelection
            rowHeight={40}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 15, 30, 50, 100]}
            onRowSelectionModelChange={handleSelectionChange}
            sx={{ border: 0 }}
            rowSelectionModel={selectedRows}
          />
        </Paper>
      )}
      <ModalWaitingList />
      <ScheduleEnrolled />
      <ModalDetails />
      <ModalStatistic />
      <ModalReject />
      <ModalSelectClass />
      {modals.rules.isOpen && (
        <ModalRules
          isOpen={modals.rules.isOpen}
          handleClose={modals.rules.close}
          inscriptionId={inscriptionId!}
          students={students}
          onRankingUpdate={setRanking}
        />
      )}
    </div>
  );
}
