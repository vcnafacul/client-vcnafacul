import ModalTemplate from "@/components/templates/modalTemplate";
import { Roles } from "@/enums/roles/roles";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getAttendanceRecordById } from "@/services/prepCourse/attendanceRecord/getAttendanceRecordbyId";
import {
  EdicaoDePresenca,
  updateRegisterStudent,
} from "@/services/prepCourse/attendanceRecord/updateRegisterStudent";
import { useAuthStore } from "@/store/auth";
import {
  AttendancePeriod,
  attendancePeriodLabel,
} from "@/types/partnerPrepCourse/attendancePeriod";
import { SimpleStudentAttendance } from "@/types/partnerPrepCourse/attendanceRecord";
import { formatDateTime } from "@/utils/date";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { EditStudentRecordModal } from "./editStudentRecordModal";
import { useModals } from "@/hooks/useModal";

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
  const [recordInfo, setRecordInfo] = useState<{
    registeredAt?: Date;
    period?: AttendancePeriod;
  }>({});
  const [studentSelected, setStudentSelected] = useState<
    SimpleStudentAttendance | undefined
  >(undefined);

  const modals = useModals(["modalEditRegister"]);

  const {
    data: { token, permissao, user },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const handleEditRegister = async (edicao: EdicaoDePresenca) => {
    await executeAsync({
      action: () => updateRegisterStudent(token, studentSelected!.id!, edicao),
      loadingMessage: "Atualizando Presença...",
      successMessage: "Presença atualizada com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        const newStudents = students.map((student) => {
          if (student.id === studentSelected!.id) {
            // Espelha a api: Presente não tem justificativa; vazia remove.
            return {
              ...student,
              present: edicao.present,
              justification: edicao.present
                ? undefined
                : edicao.justification || undefined,
              observation: {
                text: edicao.observation,
                by: `${user.firstName} ${user.lastName}`,
                at: new Date().toISOString(),
              },
            };
          }
          return student;
        });
        setStudents(newStudents);
        modals.modalEditRegister.close();
      },
    });
  };

  const ModalEditRegister = () => {
    return !modals.modalEditRegister.isOpen ? null : (
      <EditStudentRecordModal
        isOpen={modals.modalEditRegister.isOpen}
        handleClose={() => modals.modalEditRegister.close()}
        handleConfirm={handleEditRegister}
        currentPresent={studentSelected!.present!}
        currentJustification={studentSelected!.justification}
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
      modals.modalEditRegister.open();
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
      valueGetter: (params) => ((params as boolean) ? "Presente" : "Ausente"),
    },
    {
      field: "justification",
      headerName: "Justificativa",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
    },
    {
      // Por que a presença foi editada (card 05) — não entra no cálculo.
      field: "observation",
      headerName: "Observação",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => {
        const o = (params.row as SimpleStudentAttendance).observation;
        if (!o) return null;
        const quem = [o.by, formatDateTime(String(o.at))]
          .filter(Boolean)
          .join(" em ");
        return (
          <Tooltip title={quem ? `Alterado por ${quem}` : ""}>
            <span className="truncate">{o.text}</span>
          </Tooltip>
        );
      },
    },
  ];
  const paginationModel = { page: 0, pageSize: 10 };

  useEffect(() => {
    getAttendanceRecordById(token, attendanceId).then((res) => {
      const data = res.studentAttendance.map((s) => ({
        id: s.id,
        present: s.present,
        justification: s.justification,
        observation: s.observation,
        studentName: s.student.name,
        cod_enrolled: s.student.cod_enrolled,
      }));
      setStudents(data);
      setRecordInfo({ registeredAt: res.registeredAt, period: res.period });
    });
  }, []);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md w-[90vw] h-[90vh] sm:h-[600px] flex flex-col"
    >
      {(recordInfo.registeredAt || recordInfo.period) && (
        <div className="mb-2 text-sm text-gray-700 shrink-0">
          {recordInfo.registeredAt && (
            <span className="font-semibold">
              {new Date(recordInfo.registeredAt).toLocaleDateString("pt-BR")}
            </span>
          )}
          {recordInfo.period && (
            <span className="ml-2">
              — Período:{" "}
              <span className="font-semibold">
                {attendancePeriodLabel[recordInfo.period]}
              </span>
            </span>
          )}
        </div>
      )}
      {/* flex-1 em vez de 95%: somado à linha da data passava da caixa. */}
      <Paper sx={{ flex: 1, minHeight: 0, width: "100%" }}>
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
      {ModalEditRegister()}
    </ModalTemplate>
  );
}
