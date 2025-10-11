import ModalTemplate from "@/components/templates/modalTemplate";
import { Roles } from "@/enums/roles/roles";
import { getAttendanceRecordById } from "@/services/prepCourse/attendanceRecord/getAttendanceRecordbyId";
import { updateRegisterStudent } from "@/services/prepCourse/attendanceRecord/updateRegisterStudent";
import { useAuthStore } from "@/store/auth";
import { SimpleStudentAttendance } from "@/types/partnerPrepCourse/attendanceRecord";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { EditStudentRecordModal } from "./editStudentRecordModal";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  attendanceId: string;
}

export function AttendanceRecordModal({
  isOpen,
  handleClose,
  attendanceId,
}: AttendanceRecordProps) {
  const [students, setStudents] = useState<SimpleStudentAttendance[]>([]);
  const [studentSelected, setStudentSelected] = useState<
    SimpleStudentAttendance | undefined
  >(undefined);
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const handleEditRegister = (reason: string, present: boolean) => {
    const id = toast.loading("Atualizando Presença...");
    updateRegisterStudent(token, studentSelected!.id!, reason, present)
      .then(() => {
        setOpenModalEdit(false);
        const newStudents = students.map((student) => {
          if (student.id === studentSelected!.id) {
            return {
              ...student,
              present: present,
              justification: reason,
            };
          }
          return student;
        });
        setStudents(newStudents);
        toast.update(id, {
          render: "Presença atualizada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        })
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

  const ModalEditRegister = () => {
    return !openModalEdit ? null : (
      <EditStudentRecordModal
        isOpen={openModalEdit}
        handleClose={() => setOpenModalEdit(false)}
        handleConfirm={(message, present) =>
          handleEditRegister(message!, present)
        }
        currentPresent={studentSelected!.present!}
      />
    );
  };

  const handleActionUpdate = (params: SimpleStudentAttendance) => {
    if (!permissao[Roles.gerenciarTurmas]) {
      toast.warn("Você não tem permissão para editar presença", {
        theme: "dark",
      });
    } else {
      setStudentSelected(params);
      setOpenModalEdit(true);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "Action",
      headerName: "Ações",
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div>
          <Tooltip title="Editar Presença">
            <IconButton onClick={() => handleActionUpdate(params.row)}>
              <MdModeEditOutline className="h-6 w-6 fill-marine opacity-70 hover:opacity-100" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
    {
      field: "studentName",
      headerName: "Nome",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "cod_enrolled",
      headerName: "Código de Matrícula",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "present",
      headerName: "Presença",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
      valueGetter: (params) =>
         
        (params as boolean) ? "Presente" : "Ausente",
    },
    {
      field: "justification",
      headerName: "Justificativa",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
    },
  ];
  const paginationModel = { page: 0, pageSize: 10 };

  useEffect(() => {
    getAttendanceRecordById(token, attendanceId).then((res) => {
      const data = res.studentAttendance.map((s) => ({
        id: s.id,
        present: s.present,
        justification: s.justification,
        studentName: s.student.name,
        cod_enrolled: s.student.cod_enrolled,
      }));
      setStudents(data);
    });
  }, []);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md w-[90vw] h-[90vh] sm:h-[600px]"
    >
      <Paper sx={{ height: "95%", width: "100%" }}>
        <DataGrid
          rows={students}
          columns={columns}
          rowCount={students.length}
          initialState={{ pagination: { paginationModel } }}
          rowHeight={43}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>
      <ModalEditRegister />
    </ModalTemplate>
  );
}
