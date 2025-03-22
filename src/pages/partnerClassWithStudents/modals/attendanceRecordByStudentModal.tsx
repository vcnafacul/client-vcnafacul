import ModalTemplate from "@/components/templates/modalTemplate";
import { getAttendanceRecordByStudentId } from "@/services/prepCourse/attendanceRecord/getAttendanceRecordByStudentId";
import { useAuthStore } from "@/store/auth";
import { AttendanceRecordByStudent } from "@/types/partnerPrepCourse/attendanceRecord";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  const [totalItems, setTotalItems] = useState<number>(0);
  const limit = 10;

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
  const paginationModel = { page: 0, pageSize: limit };

  const handleGetAttendances = async (page: number, limit: number) => {
    getAttendanceRecordByStudentId(token, page, limit, classId, studentId)
      .then((res) => {
        const data: AttendanceRecordByStudent[] = res.data.map((s) => ({
          id: s.id,
          registeredAt: s.registeredAt,
          present: s.studentAttendance[0].present ? "Presente" : "Ausente",
          justification: s.studentAttendance[0]?.justification?.justification,
        }));
        setAttendances(data);
        setTotalItems(res.totalItems);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  useEffect(() => {
    handleGetAttendances(paginationModel.page + 1, paginationModel.pageSize);
  }, []);

  const percent =
    (attendances.filter((a) => a.present === "Presente").length /
      attendances.length) *
      100 || 0;

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 pb-1 rounded-md w-[90vw] h-[90vh] sm:h-[621px]"
    >
      <div className="flex flex-col p-2 pt-0">
        <h1 className="text-2xl font-bold">Registro de Presença</h1>
        <div>
          <span className="font-medium">Aproveitamento:</span>
          <span className="px-2">{percent.toFixed(2)}%</span>
        </div>
      </div>
      <Paper sx={{ height: "85%", width: "100%" }}>
        <DataGrid
          rows={attendances}
          columns={columns}
          rowCount={totalItems}
          paginationMode="server"
          initialState={{ pagination: { paginationModel } }}
          rowHeight={40}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
          onPaginationModelChange={(newPageSize) => {
            handleGetAttendances(newPageSize.page + 1, newPageSize.pageSize);
          }}
        />
      </Paper>
    </ModalTemplate>
  );
}
