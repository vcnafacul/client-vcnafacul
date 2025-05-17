/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Button } from "@/components/ui/button";
import { applyJustication } from "@/services/prepCourse/attendanceRecord/applyJustication";
import { getAttendanceRecordByStudentId } from "@/services/prepCourse/attendanceRecord/getAttendanceRecordByStudentId";
import { useAuthStore } from "@/store/auth";
import { AttendanceRecordByStudent } from "@/types/partnerPrepCourse/attendanceRecord";
import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  studentId: string;
}

export function AttendanceRecordByStudentModal({
  isOpen,
  handleClose,
  studentId,
}: AttendanceRecordProps) {
  const [attendances, setAttendances] = useState<AttendanceRecordByStudent[]>(
    []
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openModalJustification, setOpenModalJustification] = useState(false);
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
      minWidth: 200,
      filterable: false,
      sortable: false,
      renderCell: (params) => {
        const date = new Date(params.row.registeredAt);
        return date.toLocaleDateString("pt-BR");
      },
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

  const handleApplyJustification = (justification?: string) => {
    if (selectedRows.length === 0) {
      toast.warn("Selecione pelo menos um registro");
      return;
    }
    if (!justification) {
      toast.warn("Preencha a justificativa");
      return;
    }
    const id = toast.loading("Aplicando justificativa...");
    applyJustication(token, studentId, selectedRows, justification)
      .then(() => {
        toast.update(id, {
          render: "Justificativa aplicada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleClose!();
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao aplicar justificativa!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const ModalApplyJustification = () => {
    return !openModalJustification ? null : (
      <ModalConfirmCancelMessage
        isOpen={openModalJustification}
        handleClose={() => setOpenModalJustification(false)}
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
      className="bg-white p-4 pb-1 rounded-md w-[90vw] h-[90vh] sm:h-[621px]"
    >
      <div className="flex items-center justify-between p-2">
        <h1 className="text-2xl font-bold">Registro de Presença</h1>
        <Button
          onClick={() => setOpenModalJustification(true)}
          className="bg-orange/70 hover:bg-orange font-black"
        >
          Aplicar Justificativa
        </Button>
      </div>
      <Paper sx={{ height: "85%", width: "100%" }}>
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
          sx={{ border: 0 }}
          onPaginationModelChange={(newPageSize) => {
            handleGetAttendances(newPageSize.page + 1, newPageSize.pageSize);
          }}
        />
      </Paper>
      <ModalApplyJustification />
    </ModalTemplate>
  );
}
