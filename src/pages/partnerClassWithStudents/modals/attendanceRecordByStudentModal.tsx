/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Button } from "@/components/ui/button";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { applyJustication } from "@/services/prepCourse/attendanceRecord/applyJustication";
import { getAttendanceRecordByStudentId } from "@/services/prepCourse/attendanceRecord/getAttendanceRecordByStudentId";
import { useAuthStore } from "@/store/auth";
import { AttendancePeriod, attendancePeriodLabel } from "@/types/partnerPrepCourse/attendancePeriod";
import { AttendanceRecordByStudent } from "@/types/partnerPrepCourse/attendanceRecord";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PeriodJustificationList } from "./periodJustificationList";
import { PeriodJustificationModal } from "./periodJustificationModal";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  studentId: string;
  coursePeriodStart?: Date;
  coursePeriodEnd?: Date;
}

export function AttendanceRecordByStudentModal({
  isOpen,
  handleClose,
  studentId,
  coursePeriodStart,
  coursePeriodEnd,
}: AttendanceRecordProps) {
  const [attendances, setAttendances] = useState<AttendanceRecordByStudent[]>(
    []
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodRefreshTrigger, setPeriodRefreshTrigger] = useState(0);
  const limit = 10;

  const modals = useModals(["modalApplyJustification"]);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const columns: GridColDef[] = [
    {
      field: "registeredAt",
      headerName: "Registrado em",
      align: "center",
      headerAlign: "center",
      minWidth: 200,
      filterable: false,
      sortable: false,
      renderCell: (params) => {
        const date = new Date(params.row.registeredAt);
        return date.toLocaleDateString("pt-BR");
      },
    },
    {
      field: "period",
      headerName: "Período",
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      filterable: false,
      sortable: false,
      renderCell: (params) =>
        params.row.period ? attendancePeriodLabel[params.row.period as AttendancePeriod] : "-",
    },
    {
      field: "className",
      headerName: "Turma",
      align: "center",
      headerAlign: "center",
      minWidth: 200,
      filterable: false,
      sortable: false,
    },
    {
      field: "present",
      headerName: "Presença",
      align: "center",
      headerAlign: "center",
      minWidth: 200,
      filterable: false,
      sortable: false,
    },
    {
      field: "justification",
      headerName: "Justificativa",
      align: "center",
      headerAlign: "center",
      flex: 1,
      minWidth: 200,
      filterable: false,
      sortable: false,
    },
  ];
  const paginationModel = { page: 0, pageSize: limit };

  const handleGetAttendances = async (page: number, limit: number) => {
    getAttendanceRecordByStudentId(token, page, limit, studentId)
      .then((res) => {
        const data: AttendanceRecordByStudent[] = res.data.map((s) => ({
          id: s.id,
          registeredAt: s.registeredAt,
          period: s.period,
          present: s.studentAttendance[0].present ? "Presente" : "Ausente",
          justification: s.studentAttendance[0]?.justification?.justification,
          className: s.class.name,
        }));
        setAttendances(
          data.sort((a, b) => (b.registeredAt > a.registeredAt ? 1 : -1))
        );
        setTotalItems(res.totalItems);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  useEffect(() => {
    handleGetAttendances(paginationModel.page + 1, paginationModel.pageSize);
  }, []);

  const handleSelectionChange = useCallback(
    (newSelection: any) => {
      setSelectedRows((prevSelection) => {
        const currentPageIds = attendances.map((row) => row.id);

        // Filtra os que estavam na página atual e foram desmarcados
        const removed = prevSelection.filter(
          (id) => !newSelection.includes(id) && currentPageIds.includes(id)
        );

        // Adiciona os novos selecionados
        const added = newSelection.filter(
          (id: string) => !prevSelection.includes(id)
        );

        return [
          ...prevSelection.filter((id) => !removed.includes(id)),
          ...added,
        ];
      });
    },
    [attendances]
  );

  const handleApplyJustification = async (justification?: string) => {
    if (selectedRows.length === 0) {
      toast.warn("Selecione pelo menos um registro");
      return;
    }
    if (!justification) {
      toast.warn("Preencha a justificativa");
      return;
    }

    await executeAsync({
      action: () =>
        applyJustication(token, studentId, selectedRows, justification),
      loadingMessage: "Aplicando justificativa...",
      successMessage: "Justificativa aplicada com sucesso!",
      errorMessage: "Erro ao aplicar justificativa",
      onSuccess: () => {
        handleClose!();
      },
    });
  };

  const ModalApplyJustification = () => {
    return !modals.modalApplyJustification.isOpen ? null : (
      <ModalConfirmCancelMessage
        isOpen={modals.modalApplyJustification.isOpen}
        handleClose={() => modals.modalApplyJustification.close()}
        handleConfirm={handleApplyJustification}
        className="bg-white p-8 rounded-md"
        text="Descreva a justificativa:"
      />
    );
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md w-[90vw] max-w-5xl h-[90vh] sm:h-[621px] flex flex-col min-h-0 overflow-hidden shadow-lg"
    >
      <div className="flex flex-1 flex-col min-h-0 gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 shrink-0">
          <h1 className="text-2xl font-bold">Registro de Presença</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => modals.modalApplyJustification.open()}
              disabled={selectedRows.length === 0}
              className="bg-orange/70 hover:bg-orange font-black"
            >
              Aplicar Justificativa
            </Button>
            <Button
              onClick={() => setShowPeriodModal(true)}
              className="bg-orange/70 hover:bg-orange font-black"
            >
              Justificar Período
            </Button>
          </div>
        </div>
        <div className="shrink-0">
          <PeriodJustificationList
            studentCourseId={studentId}
            refreshTrigger={periodRefreshTrigger}
          />
        </div>
        <Paper
          sx={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <DataGrid
            rows={attendances}
            columns={columns}
            rowCount={totalItems}
            paginationMode="server"
            initialState={{ pagination: { paginationModel } }}
            rowHeight={40}
            rowSelection={true}
            checkboxSelection
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={handleSelectionChange}
            sx={{
              border: 0,
              flex: 1,
              minHeight: 0,
              height: "100%",
              "& .MuiDataGrid-main": { overflow: "auto" },
            }}
            onPaginationModelChange={(newPageSize) => {
              handleGetAttendances(newPageSize.page + 1, newPageSize.pageSize);
            }}
          />
        </Paper>
      </div>
      <ModalApplyJustification />
      <PeriodJustificationModal
        isOpen={showPeriodModal}
        handleClose={() => setShowPeriodModal(false)}
        studentCourseId={studentId}
        onSuccess={() => setPeriodRefreshTrigger((prev) => prev + 1)}
        coursePeriodStart={coursePeriodStart}
        coursePeriodEnd={coursePeriodEnd}
      />
    </ModalTemplate>
  );
}
