/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { applyJustication } from "@/services/prepCourse/attendanceRecord/applyJustication";
import { getAttendanceRecordByStudentId } from "@/services/prepCourse/attendanceRecord/getAttendanceRecordByStudentId";
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
import {
  AttendancePeriod,
  attendancePeriodLabel,
} from "@/types/partnerPrepCourse/attendancePeriod";
import { AttendanceRecordByStudent } from "@/types/partnerPrepCourse/attendanceRecord";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PeriodJustificationList } from "./periodJustificationList";
import { PeriodJustificationModal } from "./periodJustificationModal";

/** Pede o texto antes de agir: tem campo, então é Dialog (tickets/059 D21). */
function ModalJustificativa({
  titulo,
  onConfirm,
  onClose,
}: {
  titulo: string;
  onConfirm: (texto: string) => void;
  onClose: () => void;
}) {
  const [texto, setTexto] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      size="sm"
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <Field label="Justificativa" required>
          <Textarea
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            className="resize-none"
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!texto}
            onClick={() => onConfirm(texto)}
          >
            Aplicar justificativa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
    [],
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodRefreshTrigger, setPeriodRefreshTrigger] = useState(0);
  const limit = 10;

  const modals = useModals(["modalApplyJustification"]);

  const {
    data: { token, permissao },
  } = useAuthStore();
  // Justificar é gestão (a api exige Gerenciar Turmas): sem ela, a janela é
  // só leitura — sem botões nem caixas de seleção (card 07).
  const podeGerenciar = !!permissao[Roles.gerenciarTurmas];

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
        params.row.period
          ? attendancePeriodLabel[params.row.period as AttendancePeriod]
          : "-",
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
        // A ordenacao vem do backend (registeredAt DESC, period como
        // desempate). Ordenar aqui reordenaria apenas a pagina atual, o que
        // divergiria da sequencia entre paginas.
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

  const handleSelectionChange = useCallback(
    (newSelection: any) => {
      setSelectedRows((prevSelection) => {
        const currentPageIds = attendances.map((row) => row.id);

        // Filtra os que estavam na página atual e foram desmarcados
        const removed = prevSelection.filter(
          (id) => !newSelection.includes(id) && currentPageIds.includes(id),
        );

        // Adiciona os novos selecionados
        const added = newSelection.filter(
          (id: string) => !prevSelection.includes(id),
        );

        return [
          ...prevSelection.filter((id) => !removed.includes(id)),
          ...added,
        ];
      });
    },
    [attendances],
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
      errorMessage: (e: unknown) =>
        mensagemDeErro(
          e,
          "aplicar justificativa",
          "Erro ao aplicar justificativa",
        ),
      onSuccess: () => {
        handleClose!();
      },
    });
  };

  const ModalApplyJustification = () => {
    return !modals.modalApplyJustification.isOpen ? null : (
      <ModalJustificativa
        titulo="Descreva a justificativa:"
        onClose={() => modals.modalApplyJustification.close()}
        onConfirm={handleApplyJustification}
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="full" aria-describedby={undefined}>
        <DialogHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <DialogTitle>Registro de Presença</DialogTitle>
          {podeGerenciar && (
            <div className="flex flex-wrap items-center gap-2 pr-10">
              <Button
                variant="outline"
                onClick={() => modals.modalApplyJustification.open()}
                disabled={selectedRows.length === 0}
              >
                Aplicar Justificativa
              </Button>
              <Button onClick={() => setShowPeriodModal(true)}>
                Justificar Período
              </Button>
            </div>
          )}
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <div className="shrink-0">
            <PeriodJustificationList
              studentCourseId={studentId}
              refreshTrigger={periodRefreshTrigger}
            />
          </div>
          {/*
          No celular a caixa cresce e rola junto com a página: com altura
          fixa, as justificativas abertas espremiam a grade até sumir.
        */}
          <Paper
            sx={{
              flex: { xs: "none", sm: 1 },
              height: { xs: 420, sm: "auto" },
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
              rowSelection={podeGerenciar}
              checkboxSelection={podeGerenciar}
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
                handleGetAttendances(
                  newPageSize.page + 1,
                  newPageSize.pageSize,
                );
              }}
            />
          </Paper>
          {ModalApplyJustification()}
          <PeriodJustificationModal
            isOpen={showPeriodModal}
            handleClose={() => setShowPeriodModal(false)}
            studentCourseId={studentId}
            onSuccess={() => setPeriodRefreshTrigger((prev) => prev + 1)}
            coursePeriodStart={coursePeriodStart}
            coursePeriodEnd={coursePeriodEnd}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
