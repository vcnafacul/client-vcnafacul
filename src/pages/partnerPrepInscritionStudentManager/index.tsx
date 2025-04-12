import Button from "@/components/molecules/button";
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
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
import { toast } from "react-toastify";
import { ReactComponent as IsentoIcon } from "../../assets/icons/partnerPrepCourse/pagante_add_dk.svg";
import { ReactComponent as PaganteIcon } from "../../assets/icons/partnerPrepCourse/pagante_remover_dk.svg";
import { ReactComponent as Reset } from "../../assets/icons/partnerPrepCourse/reset_dk.svg";
import { ActionButton } from "./actionsButton";
import { Details } from "./modal/details";
import { Statistic } from "./modal/statistic";
import { ScheduleCallEnrolle } from "./scheduleCallEnrolled";
import { TableInfo } from "./tableInfo";
import { WaitingList } from "./waitingList";
import { Bool } from "@/enums/bool";

export function PartnerPrepInscritionStudentManager() {
  const { inscriptionId } = useParams();
  const [students, setStudents] = useState<XLSXStudentCourseFull[]>([]);
  const [openWaitingList, setOpenWaitingList] = useState<boolean>(false);
  const [openScheduleEnrolled, setOpenScheduleEnrolled] =
    useState<boolean>(false);
  const [openModalDetaild, setOpenModalDetaild] = useState<boolean>(false);
  const [openModalStatistic, setOpenModalStatistic] = useState<boolean>(false);
  const [studentSelected, setStudentSelected] = useState<
    XLSXStudentCourseFull | undefined
  >(undefined);
  const [openModalReject, setOpenModalReject] = useState<boolean>(false);

  const {
    data: { token },
  } = useAuthStore();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChange = useCallback((selectionModel: any) => {
    setSelectedRows(selectionModel);
  }, []);

  const handleIsFreeInfo = (studentId: string, isFree: boolean) => {
    const id = toast.loading("Atualizando informações...");
    updateIsFreeInfo(studentId, isFree, token)
      .then(() => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentId) {
            return { ...stu, isento: isFree ? Bool.Yes : Bool.No };
          }
          return stu;
        });
        setStudents(newStudent);
        toast.update(id, {
          render: "Informações atualizadas com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao atualizar informações",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const handleWaitingList = (studentId: string, insert: boolean) => {
    const id = toast.loading(
      `${!insert ? "Removendo da" : "Inserindo na"} lista de espera ...`
    );
    updateWaitingListInfo(inscriptionId!, studentId, insert, token)
      .then(() => {
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
        toast.dismiss(id);
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao atualizar informações",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const handleSelectEnrolledInfo = (studentId: string, selected: boolean) => {
    const id = toast.loading(
      `${!selected ? "Removendo da" : "Inserindo na"} lista de convocação ...`
    );
    updateSelectEnrolledInfo(studentId, selected, token)
      .then(() => {
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
        toast.dismiss(id);
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao atualizar informações",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const handleResetStudent = (studentId: string) => {
    const id = toast.loading("Resetando Informações...");
    resetStudent(studentId, token)
      .then(() => {
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
        toast.dismiss(id);
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao atualizar informações",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const handleScheduleEnrolled = (datas: Date[]) => {
    const id = toast.loading("Programando Convocação");
    scheduleEnrolled(inscriptionId!, datas[0], datas[1], token)
      .then(() => {
        subscribers();
        toast.dismiss(id);
        setOpenScheduleEnrolled(false);
      })
      .catch((err) => {
        toast.update(id, {
          render: err.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const handleConfirmEnrolled = (studentId: string) => {
    const id = toast.loading("Confirmando Matrícula...");
    confirmEnrolled(studentId, token).then(() => {
      const newStudent = students.map((stu) => {
        if (stu.id === studentId) {
          return {
            ...stu,
            status: StatusApplication.Enrolled,
          };
        }
        return stu;
      });
      setStudents(newStudent);
      toast.dismiss(id);
    });
  };

  const handleSendEmailDeclaredInterest = (studentId: string) => {
    const id = toast.loading("Enviando Email...");
    sendEmailDeclarationInterest(studentId, token)
      .then(() => {
        toast.update(id, {
          render: "Email enviado com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      })
      .catch((err) => {
        toast.update(id, {
          render: err.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
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

  const handleIndeferir = (studentId: string, reason: string) => {
    const id = toast.loading("Indeferir Matrícula...");
    rejectStudent(studentId, reason, token)
      .then(() => {
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
        toast.dismiss(id);
        setOpenModalReject(false);
      })
      .catch((err) => {
        toast.update(id, {
          render: err.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const ModalReject = () => {
    return !openModalReject ? null : (
      <ModalConfirmCancelMessage
        isOpen={openModalReject}
        handleClose={() => setOpenModalReject(false)}
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
    setOpenModalDetaild(true);
  };

  function mascararCPF(cpf: string) {
    // Certifique-se de que o CPF seja uma string
    cpf = cpf.toString().replace(/\D/g, ""); // Remove qualquer caractere não numérico

    if (cpf.length !== 11) {
      throw new Error("CPF inválido. O CPF deve conter 11 dígitos.");
    }

    // Formata e mascara o CPF
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "***.***.$3-$4");
  }

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
            <ActionButton
              titleAlert={`Confirmação de Matrícula ${params.row.nome} ${params.row.sobrenome}`}
              descriptionAlert={`Realizar a  confirmação de matrícula de  ${params.row.nome} ${params.row.sobrenome}`}
              onConfirm={() => {
                handleConfirmEnrolled(params.row.id);
              }}
              tooltipTitle="Confirmação de Matrícula"
            >
              <FaCheck className="h-6 w-6 fill-green3 opacity-60 hover:opacity-100" />
            </ActionButton>
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
                    setOpenModalReject(true);
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
      valueGetter: (params) => mascararCPF(params),
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
    return openWaitingList ? (
      <WaitingList
        isOpen={openWaitingList}
        handleClose={() => setOpenWaitingList(false)}
        inscriptionId={inscriptionId!}
      />
    ) : null;
  };

  const ScheduleEnrolled = () => {
    return openScheduleEnrolled ? (
      <ScheduleCallEnrolle
        isOpen={openScheduleEnrolled}
        handleClose={() => setOpenScheduleEnrolled(false)}
        handleScheduleEnrolled={handleScheduleEnrolled}
      />
    ) : null;
  };

  const ModalDetails = () => {
    return openModalDetaild ? (
      <Details
        handleClose={() => setOpenModalDetaild(false)}
        student={studentSelected!}
      />
    ) : null;
  };

  const ModalStatistic = () => {
    return openModalStatistic ? (
      <Statistic
        handleClose={() => setOpenModalStatistic(false)}
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

  const subscribers = () => {
    if (inscriptionId) {
      const id = toast.loading("Carregando Lista de Alunos...");
      getSubscribers(token, inscriptionId)
        .then((data) => {
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
          toast.dismiss(id);
        })
        .catch(() => {
          toast.update(id, {
            render: "Erro ao carregar lista de alunos",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        });
    }
  };

  useEffect(() => {
    subscribers();
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
              onClick={() => setOpenModalStatistic(true)}
            >
              <p className="text-sm">Estatisticas</p>
            </Button>
            <Button
              size="small"
              className="border-none"
              onClick={() => setOpenWaitingList(true)}
            >
              <p className="text-sm">Lista de Espera</p>
            </Button>
            <Button
              size="small"
              typeStyle="accepted"
              className="border-none"
              onClick={() => setOpenScheduleEnrolled(true)}
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
    </div>
  );
}
