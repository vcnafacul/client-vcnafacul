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
import { attendancePeriodLabel } from "@/types/partnerPrepCourse/attendancePeriod";
import { AttendanceRecordByStudent } from "@/types/partnerPrepCourse/attendanceRecord";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
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

// Opções que a grade tinha antes do R30 (o portal do MUI as limitou a uma).
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [carregando, setCarregando] = useState(true);

  const modals = useModals(["modalApplyJustification"]);

  const {
    data: { token, permissao },
  } = useAuthStore();
  // Justificar é gestão (a api exige Gerenciar Turmas): sem ela, a janela é
  // só leitura — sem botões nem caixas de seleção (card 07).
  const podeGerenciar = !!permissao[Roles.gerenciarTurmas];

  const executeAsync = useToastAsync();

  const columns: DataTableColumn<AttendanceRecordByStudent>[] = [
    {
      id: "registeredAt",
      header: "Registrado em",
      align: "center",
      mobile: "title",
      cell: (a) => new Date(a.registeredAt).toLocaleDateString("pt-BR"),
    },
    {
      id: "period",
      header: "Período",
      align: "center",
      cell: (a) => (a.period ? attendancePeriodLabel[a.period] : "-"),
    },
    { id: "className", header: "Turma", align: "center", cell: (a) => a.className },
    { id: "present", header: "Presença", align: "center", cell: (a) => a.present },
    {
      id: "justification",
      header: "Justificativa",
      align: "center",
      cell: (a) => a.justification,
    },
  ];

  const handleGetAttendances = async (page: number, limit: number) => {
    setCarregando(true);
    return getAttendanceRecordByStudentId(token, page, limit, studentId)
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
      })
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    handleGetAttendances(page, pageSize);
  }, []);

  const irParaPagina = (novaPagina: number, novoTamanho = pageSize) => {
    setPage(novaPagina);
    setPageSize(novoTamanho);
    handleGetAttendances(novaPagina, novoTamanho);
  };

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
          <Card className="flex h-[420px] w-full min-h-0 flex-none flex-col overflow-auto sm:h-auto sm:flex-1">
            <DataTable
              aria-label="Registro de presença do estudante"
              columns={columns}
              rows={attendances}
              getRowId={(a) => a.id}
              state={carregando ? "loading" : "ready"}
              density="compact"
              className="rounded-none border-0"
              selection={podeGerenciar ? selectedRows : undefined}
              onSelectionChange={podeGerenciar ? setSelectedRows : undefined}
              pagination={{
                page,
                pageSize,
                total: totalItems,
                onPageChange: (p) => irParaPagina(p),
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                onPageSizeChange: (n) => irParaPagina(1, n),
              }}
              renderMobileCard={(a) => (
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">
                    {new Date(a.registeredAt).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    {[
                      a.period ? attendancePeriodLabel[a.period] : "-",
                      a.className,
                      a.present,
                    ].join(" · ")}
                  </p>
                  {a.justification && (
                    <p className="text-body-sm">{a.justification}</p>
                  )}
                </div>
              )}
            />
          </Card>
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
