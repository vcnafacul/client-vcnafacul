import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { Roles } from "@/enums/roles/roles";
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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
  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalReject, setOpenModalReject] = useState(false);
  const [confirmEnrolled, setConfirmEnrolled] = useState(false);
  const [openUpdateClass, setOpenUpdateClass] = useState(false);
  const [openStudentCards, setOpenStudentCards] = useState(false);
  const [studentSelected, setStudentSelected] = useState<StudentsDtoOutput>(
    {} as StudentsDtoOutput
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const handleModalDetaild = (id: string) => {
    const student = students.find((student) => student.id === id);
    if (student) {
      setStudentSelected(student);
      setOpenModalInfo(true);
    }
  };

  const getEnrolle = async (page: number, limit: number) => {
    getStudentsEnrolled(token, page, limit)
      .then((res) => {
        setName(res.name);
        console.log(res.students);
        setTotalItems(res.students.totalItems);
        setStudents(res.students.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancelEnrollment = (reason: string) => {
    const id = toast.loading("Indeferir Matrícula...");
    enrollmentCancelled(studentSelected.id, reason, token)
      .then(() => {
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

  const handleReactivateEnrollment = () => {
    const id = toast.loading("Reativar Matrícula...");
    reactiveEnrolled(studentSelected.id, token)
      .then(() => {
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

  const handleUpdateClass = (
    classId: string,
    name: string,
    year: number,
    endDate: Date
  ) => {
    const id = toast.loading("Atualizando turma...");
    updateClass(studentSelected.id, classId, token)
      .then(() => {
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
        toast.dismiss(id);
        setOpenUpdateClass(false);
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

  const ModalInfo = () => {
    return openModalInfo ? (
      <InfoStudentEnrolledModal
        isOpen={openModalInfo}
        handleClose={() => setOpenModalInfo(false)}
        entity={studentSelected}
      />
    ) : null;
  };

  const ModalReject = () => {
    return !openModalReject ? null : (
      <ModalConfirmCancelMessage
        isOpen={openModalReject}
        handleClose={() => setOpenModalReject(false)}
        handleConfirm={(message) => handleCancelEnrollment(message!)}
        text={`Por favor, informe o motivo do cancelamento de matrícula de ${capitalizeWords(
          studentSelected?.name
        )}.`}
        className="bg-white p-4 rounded-md w-[512px]"
      />
    );
  };

  const ModalConfirm = () => {
    return confirmEnrolled ? (
      <ModalConfirmCancel
        isOpen={confirmEnrolled}
        handleClose={() => setConfirmEnrolled(false)}
        handleConfirm={() => {
          setConfirmEnrolled(false);
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
    return openUpdateClass ? (
      <UpdateStudentClassModal
        isOpen={openUpdateClass}
        handleClose={() => setOpenUpdateClass(false)}
        classId={studentSelected.class?.id}
        handleConfirm={handleUpdateClass}
      />
    ) : null;
  };

  const ModalStudentCards = () => {
    return openStudentCards ? (
      <PrinterStudentCards
        isOpen={openStudentCards}
        handleClose={() => setOpenStudentCards(false)}
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
                      setOpenModalReject(true);
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
                      setConfirmEnrolled(true);
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
                    setOpenUpdateClass(true);
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
    setSelectedRows(selectionModel);
  }, []);

  const paginationModel = { page: 0, pageSize: limit };

  return (
    <div className="flex flex-col justify-center items-center pt-4 gap-4">
      <div className="w-full px-4">
        <h1 className="text-3xl font-bold text-center text-marine">{name}</h1>
      </div>
      <div className="w-full px-4">
        <Button
          onClick={() => setOpenStudentCards(true)}
          size="small"
          className="bg-red border-none flex gap-2 items-center hover:bg-red"
          disabled={selectedRows.length === 0}
        >
          <div className="flex gap-2 items-center justify-center">
            <FaAddressCard className="w-5 h-5" /> Carteirinhas
          </div>
        </Button>
      </div>
      <Paper sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={students}
          columns={columns}
          rowCount={totalItems}
          paginationMode="server"
          initialState={{ pagination: { paginationModel } }}
          rowHeight={40}
          disableRowSelectionOnClick
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionChange}
          pageSizeOptions={[5, 10, 15, 30, 50, 100]}
          onPaginationModelChange={(newPageSize) => {
            setLimit(newPageSize.pageSize);
            getEnrolle(newPageSize.page + 1, newPageSize.pageSize);
          }}
          sx={{ border: 0 }}
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
