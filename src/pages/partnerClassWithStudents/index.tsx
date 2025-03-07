/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/molecules/button";
import { getClassById } from "@/services/prepCourse/class/getClassById";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { ClassStudent } from "@/types/partnerPrepCourse/classStudent";
import { IconButton, Tooltip } from "@mui/material";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AttendanceHistoryModal } from "./modals/attendanceHistoryModal";
import { AttendanceRecordByStudentModal } from "./modals/attendanceRecordByStudentModal";
import { IoEyeSharp } from "react-icons/io5";

export function PartnerClassWithStudents() {
  const { hashPrepCourse } = useParams();
  const [classEntity, setClassEntity] = useState<ClassEntity>(
    {} as ClassEntity
  );
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentSelected, setStudentSelected] = useState<ClassStudent>(
    {} as ClassStudent
  );
  const [openHistory, setOpenHistory] = useState(false);
  const [openRecord, setOpenRecord] = useState(false);

  const {
    data: { token },
  } = useAuthStore();

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Visualizar">
            <IconButton
              onClick={() => {
                setStudentSelected(params.row);
                setOpenRecord(true);
              }}
            >
              <IoEyeSharp className="h-6 w-6 fill-gray-500 hover:fill-marine opacity-60 hover:opacity-100" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
    {
      field: "cod_enrolled",
      headerName: "Nº de matrricula",
      width: 150,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 270,
      flex: 1,
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
      width: 150,
    },
    {
      field: "birthday",
      headerName: "Nascimento",
      minWidth: 150,
      flex: 1,
      type: "date",
    },
  ];

  const paginationModel = { page: 0, pageSize: 40 };

  const ModalAttendanceHistory = () => {
    return !openHistory ? null : (
      <AttendanceHistoryModal
        isOpen={openHistory}
        handleClose={() => setOpenHistory(false)}
        classId={hashPrepCourse!}
      />
    );
  };

  const ModalAttendanceRecordByStudent = () => {
    return !openRecord ? null : (
      <AttendanceRecordByStudentModal
        isOpen={openRecord}
        handleClose={() => setOpenRecord(false)}
        classId={hashPrepCourse!}
        studentId={studentSelected.id}
      />
    );
  };

  useEffect(() => {
    getClassById(token, hashPrepCourse!)
      .then((res) => {
        setClassEntity(res);
        setStudents(res.students);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="flex flex-col justify-center items-center pt-4">
      <div className="w-full px-4">
        <h1 className="text-3xl font-bold text-center text-marine">
          {classEntity?.name}
        </h1>
      </div>
      <div className="p-4 my-4 flex gap-2 flex-start bg-gray-50 w-full">
        <Button
          typeStyle="refused"
          size="small"
          onClick={() => setOpenHistory(true)}
        >
          Registros de Frequência
        </Button>
      </div>
      <Paper sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={students}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          rowHeight={40}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 15, 30, 50, 100]}
          sx={{ border: 0 }}
        />
      </Paper>
      <ModalAttendanceHistory />
      <ModalAttendanceRecordByStudent />
    </div>
  );
}
