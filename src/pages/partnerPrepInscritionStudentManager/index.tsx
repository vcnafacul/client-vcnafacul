import Button from "@/components/molecules/button";
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import { Bool } from "@/enums/bool";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
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
import { capitalizeWords } from "@/utils/capitalizeWords";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
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
import { ActionButton } from "./actionsButton";
import { Details } from "./modal/details";
import { Statistic } from "./modal/statistic";
import { ScheduleCallEnrolle } from "./scheduleCallEnrolled";
import { TableInfo } from "./tableInfo";
import { WaitingList } from "./waitingList";

export function PartnerPrepInscritionStudentManager() {
  const { inscriptionId } = useParams();
  const [students, setStudents] = useState<XLSXStudentCourseFull[]>([]);
  const [studentSelected, setStudentSelected] = useState<
    XLSXStudentCourseFull | undefined
  >(undefined);

  // Gerenciamento de modais com hook customizado
  const modals = useModals([
    "waitingList",
    "scheduleEnrolled",
    "details",
    "statistic",
    "reject",
    "selectClass",
  ]);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

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
    selected: boolean
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

    await executeAsync({
      action: () => confirmEnrolled(studentSelected.id, classId, token),
      loadingMessage: "Confirmando Matrícula...",
      successMessage: `Matrícula confirmada com sucesso na turma ${className}!`,
      errorMessage: "Erro ao confirmar matrícula",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentSelected.id) {
            return {
              ...stu,
              status: StatusApplication.Enrolled,
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.selectClass.close();
      },
    });
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
    custonsStatusReject?: StatusApplication[]
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
          studentSelected?.nome + " " + studentSelected?.sobrenome
        )}.`}
        className="bg-white p-4 rounded-md w-[512px]"
      />
    );
  };

  const handleModalDetaild = (id: string) => {
    const student = students.find((student) => student.id === id);
    setStudentSelected(student!);
    modals.details.open();
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      minWidth: 300,
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <div className="flex justify-center items-center gap-2 h-8 flex-wrap">
          <Tooltip title="Visualizar">
            <IconButton onClick={() => handleModalDetaild(params.row.id)}>
              <IoEyeSharp className="h-6 w-6 fill-gray-500 opacity-60 hover:opacity-100" />
            </IconButton>
          </Tooltip>
          {params.row.isento === "Sim" &&
            shouldProcessApplication(
              params.row.status,
              params.row.data_convocacao
            ) && (
              <ActionButton
                titleAlert="Tem certeza que deseja torna esse aluno pagante?"
                onConfirm={() => handleIsFreeInfo(params.row.id, false)}
                tooltipTitle="Tornar Pagante"
              >
                <IsentoIcon className="h-6 w-6 fill-darkGreen opacity-60 hover:opacity-100" />
              </ActionButton>
            )}
          {params.row.isento === "Não" &&
            shouldProcessApplication(
              params.row.status,
              params.row.data_convocacao
            ) && (
              <ActionButton
                titleAlert="Tem certeza que deseja torna esse aluno isento?"
                onConfirm={() => handleIsFreeInfo(params.row.id, true)}
                tooltipTitle="Dar Isenção"
              >
                <PaganteIcon className="h-6 w-6 fill-redError opacity-60 hover:opacity-100" />
              </ActionButton>
            )}
          {shouldProcessApplication(
            params.row.status,
            params.row.data_convocacao
          ) && (
            <ActionButton
              titleAlert={`Confirme a ${
                params.row.convocar === Bool.No ? "adição" : "remoção"
              } de ${params.row.nome} ${
                params.row.sobrenome
              } da lista de convocação`}
              onConfirm={() =>
                handleSelectEnrolledInfo(
                  params.row.id,
                  params.row.convocar === Bool.No
                )
              }
              tooltipTitle={`${
                params.row.convocar === Bool.No ? "Add" : "Remover"
              } da lista de convocação`}
            >
              {params.row.convocar === Bool.No ? (
                <BsEnvelopeArrowUpFill className="h-6 w-6 fill-lime-600 opacity-60 hover:opacity-100" />
              ) : (
                <BsEnvelopeArrowDownFill className="h-6 w-6 fill-red opacity-60 hover:opacity-100" />
              )}
            </ActionButton>
          )}
          {shouldProcessApplication(
            params.row.status,
            params.row.data_convocacao
          ) && (
            <ActionButton
              titleAlert={`${
                params.row.lista_de_espera === Bool.Yes
                  ? "Remover"
                  : "Adicionar"
              } Lista de espera`}
              descriptionAlert={`Confirme a  ${
                params.row.lista_de_espera === Bool.No ? "adição" : "remoção"
              } de ${params.row.nome} ${
                params.row.sobrenome
              } da lista de espera`}
              onConfirm={() =>
                handleWaitingList(
                  params.row.id,
                  params.row.lista_de_espera === Bool.No
                )
              }
              tooltipTitle={`${
                params.row.lista_de_espera === Bool.No ? "Add" : "Remover"
              } da lista de espera`}
            >
              {params.row.lista_de_espera === Bool.No ? (
                <PiTimerFill className="h-6 w-6 fill-marine opacity-60 hover:opacity-100" />
              ) : (
                <MdTimerOff className="h-6 w-6 fill-orange opacity-60 hover:opacity-100" />
              )}
            </ActionButton>
          )}
          {params.row.status === StatusApplication.DeclaredInterest && (
            <Tooltip title="Confirmação de Matrícula">
              <IconButton
                onClick={() => handleOpenSelectClassModal(params.row.id)}
              >
                <FaCheck className="h-6 w-6 fill-green3 opacity-60 hover:opacity-100" />
              </IconButton>
            </Tooltip>
          )}
          {(params.row.status === StatusApplication.DeclaredInterest ||
            params.row.status === StatusApplication.MissedDeadline ||
            params.row.status === StatusApplication.UnderReview) && (
            <Tooltip title="Indeferir">
              <IconButton>
                <IoClose
                  onClick={() => {
                    setStudentSelected(
                      students.find((student) => student.id === params.row.id)!
                    );
                    modals.reject.open();
                  }}
                  className="h-6 w-6 fill-redError/60 hover:fill-redError cursor-pointer"
                />
              </IconButton>
            </Tooltip>
          )}
          {shouldProcessApplication(
            params.row.status,
            params.row.data_convocacao,
            [StatusApplication.Enrolled, StatusApplication.DeclaredInterest]
          ) && (
            <ActionButton
              titleAlert="Deseja resetar as informações do aluno?"
              onConfirm={() => handleResetStudent(params.row.id)}
              tooltipTitle="Resetar"
            >
              <Reset className="h-6 w-6 fill-red/70 hover:fill-red" />
            </ActionButton>
          )}
          {params.row.status === StatusApplication.CalledForEnrollment &&
            !params.row.sended_email_recently &&
            params.row.data_convocacao &&
            new Date() >= params.row.data_convocacao && (
              <ActionButton
                titleAlert={`Confirmação de Matrícula ${params.row.nome} ${params.row.sobrenome}`}
                descriptionAlert={`Realizar a  confirmação de matrícula de  ${params.row.nome} ${params.row.sobrenome}`}
                onConfirm={() => {
                  handleSendEmailDeclaredInterest(params.row.id);
                }}
                tooltipTitle="Reenviar email de convocação"
              >
                <MdEmail className="h-6 w-6 fill-sky-500 opacity-60 hover:opacity-100" />
              </ActionButton>
            )}
        </div>
      ),
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
          })
        );
        setStudentSelected(data[0]);
      },
    });
  };

  useEffect(() => {
    subscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col justify-center items-center pt-4">
      <div className="w-full px-4">
        <h1 className="text-3xl font-bold text-center text-marine">
          Gerenciamento de Inscritos
        </h1>
        <div className="h-full w-full flex pb-2 flex-col sm:flex-row gap-2 sm:gap-0">
          <TableInfo students={students} />
          <div className="items-end flex flex-wrap gap-1 justify-end flex-1">
            <Button
              size="small"
              className="border-none"
              typeStyle="refused"
              onClick={modals.statistic.open}
            >
              <p className="text-sm">Estatisticas</p>
            </Button>
            <Button
              size="small"
              className="border-none"
              onClick={modals.waitingList.open}
            >
              <p className="text-sm">Lista de Espera</p>
            </Button>
            <Button
              size="small"
              typeStyle="accepted"
              className="border-none"
              onClick={modals.scheduleEnrolled.open}
            >
              <p className="text-sm">Programar Convocação</p>
            </Button>
            <FaSyncAlt
              className="h-7 w-7 p-0.5 fill-gray-500 hover:fill-marine cursor-pointer hover:animate-rotate5"
              onClick={() => subscribers()}
            />
          </div>
        </div>
      </div>
      <Paper sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={students}
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
      <ModalWaitingList />
      <ScheduleEnrolled />
      <ModalDetails />
      <ModalStatistic />
      <ModalReject />
      <ModalSelectClass />
    </div>
  );
}
