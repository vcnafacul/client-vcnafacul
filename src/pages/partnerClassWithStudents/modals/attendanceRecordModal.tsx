import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/ui/data-table";
import { ordenarLinhas } from "@/lib/ordenarLinhas";
import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "@/lib/toast";
import { EditStudentRecordModal } from "./editStudentRecordModal";
import { useModals } from "@/hooks/useModal";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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

  const [sort, setSort] = useState<DataTableSort | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const linhas = useMemo(
    () =>
      ordenarLinhas(students, sort, {
        studentName: (s) => s.studentName,
        cod_enrolled: (s) => s.cod_enrolled,
        present: (s) => (s.present ? "Presente" : "Ausente"),
        justification: (s) => s.justification,
      }),
    [students, sort],
  );

  const acaoEditar = (s: SimpleStudentAttendance) => (
    <TooltipProvider><Tooltip><TooltipTrigger asChild>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Editar Presença"
        onClick={() => handleActionUpdate(s)}
      >
        <Pencil className="h-6 w-6 text-primary opacity-70 hover:opacity-100" />
      </Button>
    </TooltipTrigger><TooltipContent>Editar Presença</TooltipContent></Tooltip></TooltipProvider>
  );

  const observacao = (s: SimpleStudentAttendance) => {
    // Por que a presença foi editada (card 05) — não entra no cálculo.
    const o = s.observation;
    if (!o) return null;
    const quem = [o.by, formatDateTime(String(o.at))]
      .filter(Boolean)
      .join(" em ");
    if (!quem) return <span className="truncate">{o.text}</span>;
    return (
      <TooltipProvider><Tooltip><TooltipTrigger asChild>
        <span className="truncate">{o.text}</span>
      </TooltipTrigger><TooltipContent>{`Alterado por ${quem}`}</TooltipContent></Tooltip></TooltipProvider>
    );
  };

  const columns: DataTableColumn<SimpleStudentAttendance>[] = [
    {
      id: "Action",
      header: "Ações",
      align: "center",
      width: "90px",
      mobile: "hidden",
      cell: (s) => acaoEditar(s),
    },
    {
      id: "studentName",
      header: "Nome",
      align: "center",
      sortable: true,
      mobile: "title",
      cell: (s) => s.studentName,
    },
    {
      id: "cod_enrolled",
      header: "Código de Matrícula",
      align: "center",
      sortable: true,
      cell: (s) => s.cod_enrolled,
    },
    {
      id: "present",
      header: "Presença",
      align: "center",
      sortable: true,
      cell: (s) => (s.present ? "Presente" : "Ausente"),
    },
    {
      id: "justification",
      header: "Justificativa",
      align: "center",
      sortable: true,
      cell: (s) => s.justification,
    },
    {
      id: "observation",
      header: "Observação",
      align: "center",
      width: "220px",
      cell: (s) => observacao(s),
    },
  ];

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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="full" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Registro de chamada</DialogTitle>
          {(recordInfo.registeredAt || recordInfo.period) && (
            <div className="text-body text-foreground">
              {recordInfo.registeredAt && (
                <span className="font-semibold">
                  {new Date(recordInfo.registeredAt).toLocaleDateString(
                    "pt-BR",
                  )}
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
        </DialogHeader>
        {/* flex-1 em vez de 95%: somado à linha da data passava da caixa. */}
        <DialogBody className="flex flex-col overflow-hidden">
          <Card className="min-h-0 w-full flex-1 overflow-auto">
            <DataTable
              aria-label="Registro de chamada"
              columns={columns}
              rows={linhas}
              getRowId={(s) => s.id}
              sort={sort}
              onSortChange={setSort}
              density="compact"
              className="rounded-none border-0"
              pagination={{
                page,
                pageSize,
                total: linhas.length,
                onPageChange: setPage,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                onPageSizeChange: (n) => {
                  setPageSize(n);
                  setPage(1);
                },
              }}
              renderMobileCard={(s) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 break-words font-semibold">
                      {s.studentName}
                    </p>
                    {acaoEditar(s)}
                  </div>
                  <p className="text-body-sm text-muted-foreground">
                    {s.cod_enrolled} · {s.present ? "Presente" : "Ausente"}
                  </p>
                  {s.justification && (
                    <p className="text-body-sm">{s.justification}</p>
                  )}
                  {observacao(s)}
                </div>
              )}
            />
          </Card>
          {ModalEditRegister()}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
