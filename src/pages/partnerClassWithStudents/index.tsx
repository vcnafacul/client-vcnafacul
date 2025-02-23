/* eslint-disable @typescript-eslint/no-explicit-any */
import { getClassById } from "@/services/prepCourse/class/getClassById";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { ClassStudent } from "@/types/partnerPrepCourse/classStudent";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function PartnerClassWithStudents() {
  const { hashPrepCourse } = useParams();
  const [classEntity, setClassEntity] = useState<ClassEntity>(
    {} as ClassEntity
  );
  const [students, setStudents] = useState<ClassStudent[]>([]);

  const {
    data: { token },
  } = useAuthStore();

  const columns: GridColDef[] = [
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

  const paginationModel = { page: 0, pageSize: 10 };

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
    </div>
  );
}
