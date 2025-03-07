import ModalTemplate from "@/components/templates/modalTemplate";
import { getAttendanceRecordByStudentId } from "@/services/prepCourse/attendanceRecord/getAttendanceRecordByStudentId";
import { useAuthStore } from "@/store/auth";
import { AttendanceRecordByStudent } from "@/types/partnerPrepCourse/attendanceRecord";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
  studentId: string;
}

export function AttendanceRecordByStudentModal({
  isOpen,
  handleClose,
  classId,
  studentId,
}: AttendanceRecordProps) {
  const [attendances, setAttendances] = useState<AttendanceRecordByStudent[]>(
    []
  );

  const {
    data: { token },
  } = useAuthStore();

  const columns: GridColDef[] = [
    {
      field: "registeredAt",
      headerName: "Registrado em",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const date = new Date(params.row.registeredAt);
        return (
          date.toLocaleDateString("pt-BR") +
          " " +
          date.toLocaleTimeString("pt-BR")
        );
      },
    },
    {
      field: "present",
      headerName: "Presença",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
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
    getAttendanceRecordByStudentId(token, classId, studentId).then((res) => {
      const data: AttendanceRecordByStudent[] = res.map((s) => ({
        id: s.id,
        registeredAt: s.registeredAt,
        present:
          s.studentAttendance.length > 0
            ? s.studentAttendance[0].present
              ? "Presente"
              : "Ausente"
            : "Sem Registro",
        justification: s.studentAttendance[0]?.justification,
      }));
      setAttendances(data);
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
          rows={attendances}
          columns={columns}
          rowCount={attendances.length}
          initialState={{ pagination: { paginationModel } }}
          rowHeight={43}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>
    </ModalTemplate>
  );
}
