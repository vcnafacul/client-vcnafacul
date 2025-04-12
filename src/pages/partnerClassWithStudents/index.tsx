/* eslint-disable @typescript-eslint/no-explicit-any */
import logo from "@/assets/images/logo_carteirinha.png";
import Button from "@/components/molecules/button";
import { Bool } from "@/enums/bool";
import { Roles } from "@/enums/roles/roles";
import { getClassById } from "@/services/prepCourse/class/getClassById";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { ClassStudent } from "@/types/partnerPrepCourse/classStudent";
import { downloadPDF } from "@/utils/get-pdf";
import { getBase64FromImageUrl } from "@/utils/getBase64FromImageUrl";
import { IconButton, Tooltip } from "@mui/material";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { useEffect, useState } from "react";
import { FaListCheck } from "react-icons/fa6";
import { GoGraph } from "react-icons/go";
import { IoEyeSharp } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AttendanceHistoryModal } from "./modals/attendanceHistoryModal";
import { AttendanceRecordByStudentModal } from "./modals/attendanceRecordByStudentModal";
import { StatisticModal } from "./modals/statistic";

export function PartnerClassWithStudents() {
  const { hashClassId } = useParams();
  const [classEntity, setClassEntity] = useState<ClassEntity>(
    {} as ClassEntity
  );
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentSelected, setStudentSelected] = useState<ClassStudent>(
    {} as ClassStudent
  );
  const [openHistory, setOpenHistory] = useState(false);
  const [openRecord, setOpenRecord] = useState(false);

  const [openModalStatistic, setOpenModalStatistic] = useState<boolean>(false);

  const {
    data: { token, permissao },
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
        classId={hashClassId!}
      />
    );
  };

  const ModalAttendanceRecordByStudent = () => {
    return !openRecord ? null : (
      <AttendanceRecordByStudentModal
        isOpen={openRecord}
        handleClose={() => setOpenRecord(false)}
        classId={hashClassId!}
        studentId={studentSelected.id}
      />
    );
  };

  const ModalStatistic = () => {
    return !openModalStatistic ? null : (
      <StatisticModal
        isOpen={openModalStatistic}
        handleClose={() => setOpenModalStatistic(false)}
        data={{
          forms: students.map((student) => student.socioeconomic),
          isFree: students.map((student) => student.isFree === Bool.Yes),
        }}
      />
    );
  };

  useEffect(() => {
    const id = toast.loading("Carregando alunos...");
    getClassById(token, hashClassId!)
      .then((res) => {
        setClassEntity(res);
        setStudents(res.students.sort((a, b) => a.name.localeCompare(b.name)));
        toast.dismiss(id);
      })
      .catch((err) => {
        toast.update(id, {
          render: err.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  }, []);

  const downloadPDFClass = async () => {
    const logoBase64 = await getBase64FromImageUrl(logo);
    const rows = students.map((student) => [
      { text: student.cod_enrolled, style: "tableCell" },
      { text: student.name, style: "tableCell" },
      { text: student.email, style: "tableCell" },
    ]);

    const data: TDocumentDefinitions = {
      content: [
        {
          text: `${classEntity?.name} - Lista de Estudantes`,
          style: "header",
          fontSize: 16,
        },
        {
          text: `Data de criação da lista: ${format(new Date(), "dd/MM/yyyy")}`,
          style: "header",
          marginBottom: 20,
          fontSize: 12,
        },
        {
          image: logoBase64,
          width: 150,
          alignment: "center",
          absolutePosition: { x: 400, y: 40 },
        },
        {
          table: {
            body: [["Nº de matricula", "Nome", "Email"], ...rows],
            heights: 20,
          },
          layout: "lightHorizontalLines",
          alignment: "center", // Centraliza horizontalmente
        },
      ],
    };
    downloadPDF(data, classEntity?.name);
  };

  return (
    <div className="flex flex-col justify-center items-center pt-4">
      <div className="w-full px-4">
        <h1 className="text-3xl font-bold text-center text-marine">
          {classEntity?.name}
        </h1>
      </div>
      <div className="p-4 my-4 flex gap-2 flex-start bg-gray-50 w-full">
        {permissao[Roles.gerenciarTurmas] && (
          <Button
            typeStyle="accepted"
            size="small"
            onClick={() => setOpenHistory(true)}
            className="border-none"
          >
            <div className="flex items-center justify-center gap-2">
              <FaListCheck />
              Registros de Frequência
            </div>
          </Button>
        )}
        <Button
          typeStyle="primary"
          size="small"
          onClick={downloadPDFClass}
          className="border-none"
        >
          <div className="flex items-center justify-center gap-2">
            <MdOutlineFileDownload className="h-5 w-5 fill-white" />
            Lista de alunos
          </div>
        </Button>
        <Button
          size="small"
          className="border-none"
          typeStyle="refused"
          onClick={() => setOpenModalStatistic(true)}
        >
          <div className="flex gap-2 items-center justify-center">
            <GoGraph />
            <p className="">Estatisticas</p>
          </div>
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
      <ModalStatistic />
    </div>
  );
}
