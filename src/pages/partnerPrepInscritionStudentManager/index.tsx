import { getSubscribers } from "@/services/prepCourse/inscription/getSubscribers";
import { useAuthStore } from "@/store/auth";

import Button from "@/components/molecules/button";
import { updateWaitingListInfo } from "@/services/prepCourse/inscription/updateWaitingList";
import { updateSelectEnrolledInfo } from "@/services/prepCourse/student/updateEnrolledInfo";
import { updateIsFreeInfo } from "@/services/prepCourse/student/updateIsFreeInfo";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import Paper from "@mui/material/Paper";

import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { confirmEnrolled } from "@/services/prepCourse/student/confirmEnrolled";
import { scheduleEnrolled } from "@/services/prepCourse/student/scheduleEnrolled";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { FaCheck, FaSyncAlt } from "react-icons/fa";
import { LiaCoinsSolid } from "react-icons/lia";
import { MdOutlineMoneyOffCsred, MdPlaylistRemove } from "react-icons/md";
import { PiListChecksFill } from "react-icons/pi";
import { RiFileListFill, RiFileListLine } from "react-icons/ri";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ActionButton } from "./actionsButton";
import { ScheduleCallEnrolle } from "./scheduleCallEnrolled";
import { TableInfo } from "./tableInfo";
import { WaitingList } from "./waitingList";

enum Bool {
  Yes = "Sim",
  No = "Não",
}

export function PartnerPrepInscritionStudentManager() {
  const { inscriptionId } = useParams();
  const [students, setStudents] = useState<XLSXStudentCourseFull[]>([]);
  const [openWaitingList, setOpenWaitingList] = useState<boolean>(false);
  const [openScheduleEnrolled, setOpenScheduleEnrolled] =
    useState<boolean>(false);

  const {
    data: { token },
  } = useAuthStore();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChange = (selectionModel: any) => {
    setSelectedRows(selectionModel);
  };

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
      `${insert ? "Removendo da" : "Inserindo na"} lista de espera ...`
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
    const id = toast.loading("Progrmando Convocação");
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

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      width: 210,
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <div className="flex justify-center items-center gap-2 h-8 flex-wrap">
          {params.row.isento === "Sim" &&
            params.row.status === StatusApplication.UnderReview && (
              <ActionButton
                titleAlert="Tem certeza que deseja torna esse aluno pagante?"
                onConfirm={() => handleIsFreeInfo(params.row.id, false)}
                tooltipTitle="Tornar Pagante"
              >
                <LiaCoinsSolid className="h-6 w-6 fill-amber-600 opacity-60 hover:opacity-100" />
              </ActionButton>
            )}
          {params.row.isento === "Não" &&
            params.row.status === StatusApplication.UnderReview && (
              <ActionButton
                titleAlert="Tem certeza que deseja torna esse aluno isento?"
                onConfirm={() => handleIsFreeInfo(params.row.id, true)}
                tooltipTitle="Dar Isenção"
              >
                <MdOutlineMoneyOffCsred className="h-6 w-6 fill-green2 opacity-60 hover:opacity-100" />
              </ActionButton>
            )}
          {params.row.status === StatusApplication.UnderReview && (
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
                <PiListChecksFill className="h-6 w-6 fill-lime-600 opacity-60 hover:opacity-100" />
              ) : (
                <MdPlaylistRemove className="h-6 w-6 fill-red opacity-60 hover:opacity-100" />
              )}
            </ActionButton>
          )}
          {params.row.status === StatusApplication.UnderReview && (
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
                <RiFileListFill className="h-6 w-6 fill-marine opacity-60 hover:opacity-100" />
              ) : (
                <RiFileListLine className="h-6 w-6 fill-marine opacity-60 hover:opacity-100" />
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
        </div>
      ),
    },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "cpf",
      headerName: "CPF",
      width: 120,
    },
    {
      field: "isento",
      headerName: "Isento",
      width: 60,
      display: "flex",
      align: "center",
    },
    {
      field: "lista_de_espera",
      headerName: "L. Espera",
      description: "Lista de Espera",
      width: 100,
      display: "text",
      align: "center",
    },
    {
      field: "convocar",
      headerName: "L. Convoc",
      description: "Lista de Convocação",
      width: 100,
      display: "flex",
      align: "center",
      filterable: false,
    },
    {
      field: "data_convocacao",
      headerName: "Data Conv",
      description: "Data de Convocação para Matrícula",
      width: 120,
      type: "date",
    },
    {
      field: "data_limite_convocacao",
      headerName: "Prazo M.",
      description: "Prazo Confirmação Matrícula",
      width: 120,
      type: "date",
    },
    { field: "status", headerName: "Status", width: 150 },
    { field: "nome", headerName: "Nome", width: 100 },
    { field: "sobrenome", headerName: "Sobrenome", width: 150 },
    { field: "nome_social", headerName: "Nome Social", width: 100 },
    {
      field: "data_nascimento",
      headerName: "Data de Nascimento",
      width: 150,
      align: "center",
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    { field: "genero", headerName: "Gênero", width: 100 },
    { field: "telefone", headerName: "Telefone", width: 150 },
    { field: "bairro", headerName: "Bairro", width: 150 },
    { field: "rua", headerName: "Rua", width: 150 },
    { field: "numero", headerName: "Número", width: 70 },
    { field: "complemento", headerName: "Complemento", width: 150 },
    { field: "CEP", headerName: "CEP", width: 100 },
    { field: "cidade", headerName: "Cidade", width: 150 },
    { field: "estado", headerName: "Estado", width: 100 },
    {
      field: "nome_guardiao_legal",
      headerName: "Nome do Guardião Legal",
      width: 200,
    },
    {
      field: "telefone_guardiao_legal",
      headerName: "Telefone do Guardião Legal",
      width: 150,
    },
    {
      field: "rg_guardiao_legal",
      headerName: "RG do Guardião Legal",
      width: 150,
    },
    {
      field: "uf_guardiao_legal",
      headerName: "UF do Guardião Legal",
      width: 50,
    },
    {
      field: "cpf_guardiao_legal",
      headerName: "CPF do Guardião Legal",
      width: 150,
    },
    {
      field: "parentesco_guardiao_legal",
      headerName: "Parentesco do Guardião Legal",
      width: 110,
    },
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

  const subscribers = () => {
    if (inscriptionId) {
      const id = toast.loading("Carregando Lista de Alunos...");
      getSubscribers(token, inscriptionId)
        .then((data) => {
          setStudents(data);
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
    </div>
  );
}
