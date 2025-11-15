import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { enrollmentCancelled } from "@/services/prepCourse/student/enrollment-cancelled";
import { getStudentsEnrolled } from "@/services/prepCourse/student/getStudentsEnrolled";
import { reactiveEnrolled } from "@/services/prepCourse/student/reactive-enrolled";
import { updateClass } from "@/services/prepCourse/student/updateClass";
import { useAuthStore } from "@/store/auth";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import {
  DataGrid,
  getGridDateOperators,
  getGridStringOperators,
  GridColDef,
  GridFilterItem,
  GridSortModel,
} from "@mui/x-data-grid";
import debounce from "lodash";
import { useCallback, useEffect, useState } from "react";
import { FaAddressCard, FaCheck } from "react-icons/fa";
import { IoClose, IoEyeSharp } from "react-icons/io5";
import { MdClass } from "react-icons/md";
import { toast } from "react-toastify";
import { InfoStudentEnrolledModal } from "./modals/infoStudentEnrolledModal";
import { PrinterStudentCards } from "./modals/printerStudentCards";
import { UpdateStudentClassModal } from "./modals/updateStudentClassModal";

export function StudentsEnrolled() {
  const [name, setName] = useState<string>("");
  const [students, setStudents] = useState<StudentsDtoOutput[]>([]);
  const [limit, setLimit] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(100);
  const [studentSelected, setStudentSelected] = useState<StudentsDtoOutput>(
    {} as StudentsDtoOutput
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filter, setFilter] = useState<GridFilterItem | undefined>(undefined);
  const [sort, setSort] = useState<GridSortModel | undefined>(undefined);

  const modals = useModals([
    "modalInfo",
    "modalReject",
    "modalConfirm",
    "modalUpdateClass",
    "modalStudentCards",
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const handleModalDetaild = (id: string) => {
    const student = students.find((student) => student.id === id);
    if (student) {
      setStudentSelected(student);
      modals.modalInfo.open();
    }
  };

  const getEnrolle = async (
    page: number,
    limit: number,
    filters?: GridFilterItem,
    sortModel?: GridSortModel
  ) => {
    await executeAsync({
      action: () => getStudentsEnrolled(token, page, limit, filters, sortModel),
      loadingMessage: "Buscando alunos matriculados...",
      successMessage: "Alunos matriculados encontrados com sucesso!",
      errorMessage: "Erro ao buscar alunos matriculados",
      onSuccess: (res) => {
        setName(res.name);
        setTotalItems(res.students.totalItems);
        setStudents(res.students.data);
      },
    });
  };

  const debouncedFilter = useCallback(
    debounce.debounce(
      (value: GridFilterItem) => getEnrolle(1, limit, value, sort),
      1000
    ),
    []
  );

  const handleFilterChange = (filterModel: GridFilterItem) => {
    if (filterModel && filterModel.value !== undefined) {
      setFilter(filterModel);
      debouncedFilter(filterModel);
    }
  };

  const handleCancelEnrollment = async (reason: string) => {
    await executeAsync({
      action: () => enrollmentCancelled(studentSelected.id, reason, token),
      loadingMessage: "Indefirindo Matrícula...",
      successMessage: "Matrícula indeferida com sucesso!",
      errorMessage: "Erro ao indeferir matrícula",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentSelected.id) {
            return {
              ...stu,
              applicationStatus: StatusApplication.EnrollmentCancelled,
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.modalReject.close();
      },
    });
  };

  const handleReactivateEnrollment = async () => {
    await executeAsync({
      action: () => reactiveEnrolled(studentSelected.id, token),
      loadingMessage: "Reativando Matrícula...",
      successMessage: "Matrícula reativada com sucesso!",
      errorMessage: "Erro ao reativar matrícula",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentSelected.id) {
            return {
              ...stu,
              applicationStatus: StatusApplication.Enrolled,
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.modalReject.close();
      },
    });
  };

  const handleUpdateClass = async (
    classId: string,
    name: string,
    year: number,
    endDate: Date
  ) => {
    await executeAsync({
      action: () => updateClass(studentSelected.id, classId, token),
      loadingMessage: "Atualizando turma...",
      successMessage: "Turma atualizada com sucesso!",
      errorMessage: "Erro ao atualizar turma",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentSelected.id) {
            return {
              ...stu,
              class: {
                id: classId,
                name: name,
                year: year,
                endDate: endDate,
              },
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.modalUpdateClass.close();
      },
    });
  };

  const updateEntities = (entity: StudentsDtoOutput) => {
    setStudentSelected(entity);
    const newEntities = students.map((s) => {
      if (s.id === entity.id) {
        return entity;
      }
      return s;
    });
    setStudents(newEntities);
  };

  const ModalInfo = () => {
    return modals.modalInfo.isOpen ? (
      <InfoStudentEnrolledModal
        isOpen={modals.modalInfo.isOpen}
        handleClose={() => modals.modalInfo.close()}
        entity={studentSelected}
        updateEntity={updateEntities}
      />
    ) : null;
  };

  const ModalReject = () => {
    return !modals.modalReject.isOpen ? null : (
      <ModalConfirmCancelMessage
        isOpen={modals.modalReject.isOpen}
        handleClose={() => modals.modalReject.close()}
        handleConfirm={(message) => handleCancelEnrollment(message!)}
        text={`Por favor, informe o motivo do cancelamento de matrícula de ${capitalizeWords(
          studentSelected?.name
        )}.`}
        className="bg-white p-4 rounded-md w-[512px]"
      />
    );
  };

  const ModalConfirm = () => {
    return modals.modalConfirm.isOpen ? (
      <ModalConfirmCancel
        isOpen={modals.modalConfirm.isOpen}
        handleClose={() => modals.modalConfirm.close()}
        handleConfirm={() => {
          modals.modalConfirm.close();
          handleReactivateEnrollment();
        }}
        className="bg-white p-4 rounded-md w-[512px]"
      >
        <div className="flex flex-col gap-2">
          <Text size="secondary" className="font-semibold m-0 text-start">
            Confirmação de Matrícula
          </Text>
          <Text size="quaternary" className="m-0 text-start">
            de {studentSelected?.name}
          </Text>
        </div>
      </ModalConfirmCancel>
    ) : null;
  };

  const ModalUpdateClass = () => {
    return modals.modalUpdateClass.isOpen ? (
      <UpdateStudentClassModal
        isOpen={modals.modalUpdateClass.isOpen}
        handleClose={() => modals.modalUpdateClass.close()}
        classId={studentSelected.class?.id}
        handleConfirm={handleUpdateClass}
      />
    ) : null;
  };

  const ModalStudentCards = () => {
    return modals.modalStudentCards.isOpen ? (
      <PrinterStudentCards
        isOpen={modals.modalStudentCards.isOpen}
        handleClose={() => modals.modalStudentCards.close()}
        entities={students.filter((s) => selectedRows.includes(s.id))}
      />
    ) : null;
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      width: 170,
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Visualizar">
            <IconButton onClick={() => handleModalDetaild(params.row.id)}>
              <IoEyeSharp className="h-6 w-6 fill-gray-500 opacity-60 hover:opacity-100" />
            </IconButton>
          </Tooltip>
          {permissao[Roles.gerenciarEstudantes] &&
            (params.row.applicationStatus === StatusApplication.Enrolled ? (
              <Tooltip title="Cancelar matrícula">
                <IconButton
                  onClick={() => {
                    const student = students.find(
                      (student) => student.id === params.row.id
                    );
                    if (!student) {
                      alert("Estudante não encontrado");
                    } else {
                      setStudentSelected(student);
                      modals.modalReject.open();
                    }
                  }}
                >
                  <IoClose className="h-6 w-6 fill-red opacity-60 hover:opacity-100" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Reativar matrícula">
                <IconButton
                  onClick={() => {
                    const student = students.find(
                      (student) => student.id === params.row.id
                    );
                    if (!student) {
                      alert("Estudante não encontrado");
                    } else {
                      setStudentSelected(student);
                      modals.modalConfirm.open();
                    }
                  }}
                >
                  <FaCheck className="h-6 w-6 fill-green2 opacity-60 hover:opacity-100" />
                </IconButton>
              </Tooltip>
            ))}
          {permissao[Roles.gerenciarTurmas] && (
            <Tooltip title="Alterar Turma">
              <IconButton
                onClick={() => {
                  const student = students.find(
                    (student) => student.id === params.row.id
                  );
                  if (!student) {
                    alert("Estudante não encontrado");
                  } else {
                    setStudentSelected(student);
                    modals.modalUpdateClass.open();
                  }
                }}
              >
                <MdClass className="h-6 w-6 fill-marine opacity-60 hover:opacity-100" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      field: "cod_enrolled",
      headerName: "Nº de matrricula",
      width: 150,
      align: "center",
      headerAlign: "center",
      filterOperators: getGridStringOperators().filter(({ value }) =>
        ["contains"].includes(value)
      ),
    },
    {
      field: "class",
      headerName: "Turma",
      minWidth: 100,
      width: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueGetter: (params) => (params as any).name || "Sem Turma",
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 270,
      filterOperators: getGridStringOperators().filter(({ value }) =>
        ["contains"].includes(value)
      ),
    },
    {
      field: "whatsapp",
      headerName: "Telefone",
      minWidth: 150,
      filterOperators: getGridStringOperators().filter(({ value }) =>
        ["contains"].includes(value)
      ),
    },
    {
      field: "cpf",
      headerName: "CPF",
      minWidth: 150,
      filterOperators: getGridStringOperators().filter(({ value }) =>
        ["contains"].includes(value)
      ),
    },
    {
      field: "name",
      headerName: "Nome",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "applicationStatus",
      headerName: "Status",
      minWidth: 100,
      width: 200,
      maxWidth: 200,
    },
    {
      field: "birthday",
      headerName: "Nascimento",
      minWidth: 100,
      maxWidth: 120,
      type: "date",
      filterOperators: getGridDateOperators().filter(({ value }) =>
        ["is", "after", "before"].includes(value)
      ),
    },
    {
      field: "age",
      headerName: "Idade",
      minWidth: 70,
      maxWidth: 100,
    },
  ];

  useEffect(() => {
    getEnrolle(1, limit);
  }, [limit]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChange = useCallback((selectionModel: any) => {
    if (selectionModel.length <= 20) {
      setSelectedRows(selectionModel as string[]);
    } else {
      toast.warn("Selecione no máximo 20 estudantes", {
        theme: "dark",
      });
    }
  }, []);

  const paginationModel = { page: 0, pageSize: limit };

  return (
    <div className="flex flex-col justify-center items-center pt-4 gap-4">
      <div className="w-full px-4">
        <h1 className="text-3xl font-bold text-center text-marine">{name}</h1>
      </div>
      {permissao[Roles.gerenciarEstudantes] && (
        <div className="w-full px-4">
          <Button
            onClick={() => modals.modalStudentCards.open()}
            size="small"
            className="bg-red border-none flex gap-2 items-center hover:bg-red"
            disabled={selectedRows.length === 0}
          >
            <div className="flex gap-2 items-center justify-center">
              <FaAddressCard className="w-5 h-5" /> Carteirinhas
            </div>
          </Button>
        </div>
      )}
      <Paper sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={students}
          columns={columns}
          rowCount={totalItems}
          paginationMode="server"
          initialState={{ pagination: { paginationModel } }}
          rowHeight={40}
          disableRowSelectionOnClick
          checkboxSelection={permissao[Roles.gerenciarEstudantes]}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionChange}
          pageSizeOptions={[5, 10, 15, 30, 50, 100]}
          onPaginationModelChange={(newPageSize) => {
            setLimit(newPageSize.pageSize);
            getEnrolle(
              newPageSize.page + 1,
              newPageSize.pageSize,
              filter,
              sort
            );
          }}
          sx={{ border: 0 }}
          isRowSelectable={(params) =>
            params.row.applicationStatus === StatusApplication.Enrolled &&
            params.row.class.id !== undefined
          }
          onFilterModelChange={(filterModel) => {
            if (
              filterModel &&
              filterModel.items.length > 0 &&
              !["age", "name"].includes(filterModel.items[0].field)
            ) {
              handleFilterChange(filterModel.items[0]);
            }
          }}
          onSortModelChange={(sortModel) => {
            if (
              sortModel &&
              sortModel.length > 0 &&
              !["age", "name"].includes(sortModel[0].field)
            ) {
              setSort(sortModel);
              getEnrolle(1, limit, filter, sortModel);
            }
          }}
        />
      </Paper>
      <ModalInfo />
      <ModalReject />
      <ModalConfirm />
      <ModalUpdateClass />
      <ModalStudentCards />
    </div>
  );
}
