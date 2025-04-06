import ModalTemplate from "@/components/templates/modalTemplate";
import { createAttendanceRecord } from "@/services/prepCourse/attendanceRecord/createAttendanceRecord";
import { getStudentsToAttendanceRecord } from "@/services/prepCourse/attendanceRecord/getStudentToAttendanceRecord";
import { useAuthStore } from "@/store/auth";
import { SimpleAttendanceRecordHistory } from "@/types/partnerPrepCourse/attendanceRecordHistory";
import { StudentToAttendanceRecord } from "@/types/partnerPrepCourse/classToAttendanceRecord";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Calendar } from "primereact/calendar";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
  handleNewAttendanceRecord: (data: SimpleAttendanceRecordHistory) => void;
}

export function NewAttendanceRecordModal({
  isOpen,
  handleClose,
  classId,
  handleNewAttendanceRecord,
}: AttendanceRecordProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<StudentToAttendanceRecord[]>([]);
  const [registring, setRegistering] = useState<boolean>(false);

  const {
    data: {
      token,
      user: { firstName, lastName },
    },
  } = useAuthStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChange = useCallback((selectionModel: any) => {
    setSelectedRows(selectionModel);
  }, []);

  useEffect(() => {
    getStudentsToAttendanceRecord(token, classId).then((res) => {
      setStudents(res.students);
    });
  }, []);

  const handleCreateAttendancerecord = () => {
    setRegistering(true);
    const id = toast.loading("Registrando presença...");
    createAttendanceRecord(token, classId, date, selectedRows)
      .then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (res: any) => {
          handleNewAttendanceRecord({
            id: res.id,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt,
            registeredAt: res.registeredAt,
            registeredBy: firstName + " " + lastName,
          });
          handleClose();
          toast.update(id, {
            render: "Presença registrada com sucesso!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        }
      )
      .catch((err) => {
        toast.update(id, {
          render: err.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      })
      .finally(() => {
        setRegistering(false);
      });
  };

  const paginationModel = { page: 0, pageSize: 10 };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      minWidth: 200,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "cod_enrolled",
      headerName: "Matricula",
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
    },
  ];

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-2 sm:p-6 rounded-md w-[90vw] sm:w-[700px] h-[650px] flex flex-col gap-4"
    >
      <Paper sx={{ height: "85%", width: "100%" }}>
        <DataGrid
          rows={students}
          columns={columns}
          rowCount={students.length}
          initialState={{ pagination: { paginationModel } }}
          rowHeight={40}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionChange}
          sx={{ border: 0 }}
        />
      </Paper>
      <div className="flex flex-col sm:flex-row gap-2 justify-end w-full">
        <div className="flex flex-col justify-content-center h-16 border pt-7 pl-4 rounded-md relative w-full">
          <label
            className="absolute top-1 left-3 text-xs text-grey font-semibold"
            htmlFor="date"
          >
            Data de Registro
          </label>
          <Calendar
            id="range"
            dateFormat="dd/mm/yy"
            value={date}
            showTime
            onChange={(e) => setDate(e.value as Date)}
            className="focus-visible:ring-orange rounded-md w-full"
            readOnlyInput
            hideOnRangeSelection
          />
        </div>
        <button
          type="button"
          onClick={handleCreateAttendancerecord}
          className="bg-marine hover:opacity-90 text-white font-bold py-2 px-4 rounded w-full 
            disabled:bg-opacity-75 disabled:cursor-not-allowed"
          disabled={registring}
        >
          Confirmar
        </button>
      </div>
    </ModalTemplate>
  );
}
