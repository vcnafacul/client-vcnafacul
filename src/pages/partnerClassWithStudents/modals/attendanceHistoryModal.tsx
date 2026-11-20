import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { List, ListItem } from "@/components/ui/list";
import { PaginationControls } from "@/components/ui/pagination";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
import { deleteAttendanceRecord } from "@/services/prepCourse/attendanceRecord/deleteAttendanceRecord";
import { getAttendanceRecord } from "@/services/prepCourse/attendanceRecord/getAttendanceRecord";
import { useAuthStore } from "@/store/auth";
import {
  AttendancePeriod,
  attendancePeriodLabel,
} from "@/types/partnerPrepCourse/attendancePeriod";
import { SimpleAttendanceRecordHistory } from "@/types/partnerPrepCourse/attendanceRecordHistory";
import { useEffect, useState } from "react";
import { Eye, ListPlus, ListTodo, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { AttendanceRecordModal } from "./attendanceRecordModal";
import AttendanceRecordSummaryModal from "./attendanceRecordSummaryModal";
import { NewAttendanceRecordModal } from "./newAttendanceRecordModal";
interface AttendanceHistoryProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
  coursePeriodStart?: Date;
  coursePeriodEnd?: Date;
  /** Só para o título ("Frequência · Turma A"). */
  turmaNome?: string;
}

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** "Qua, 22/10" — o ano só aparece se não for o atual. Dia de Brasília. */
function dataDaChamada(d: Date | string): string {
  const data = new Date(d);
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "short",
    })
      .formatToParts(data)
      .map((p) => [p.type, p.value]),
  );
  const diaDaSemana =
    DIAS[
      new Date(`${partes.year}-${partes.month}-${partes.day}T12:00:00`).getDay()
    ];
  const ano =
    Number(partes.year) === new Date().getFullYear() ? "" : `/${partes.year}`;
  return `${diaDaSemana}, ${partes.day}/${partes.month}${ano}`;
}

export function AttendanceHistoryModal({
  isOpen,
  handleClose,
  classId,
  coursePeriodStart,
  coursePeriodEnd,
  turmaNome,
}: AttendanceHistoryProps) {
  const [attendanceHistory, setAttendanceHistory] = useState<
    SimpleAttendanceRecordHistory[]
  >([]);
  const [attendanceHistorySelected, setAttendanceHistorySelected] =
    useState<SimpleAttendanceRecordHistory>();
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState(1);
  /** A primeira página chegou? Antes disso não dá para dizer que está vazio. */
  const [carregou, setCarregou] = useState(false);
  /** Falhou ao carregar: sem isto a lista ficava no esqueleto para sempre. */
  const [erro, setErro] = useState(false);
  const limit = 10;

  const {
    data: { token, permissao },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const modals = useModals([
    "modalAttendanceRecord",
    "modalNewAttendanceRecord",
    "modalConfirmDelete",
    "modalAttendanceRecordSummary",
  ]);

  const handleActionDeleteRecord = (params: SimpleAttendanceRecordHistory) => {
    if (!permissao[Roles.gerenciarTurmas]) {
      toast.warn("Você não tem permissão para excluir registros", {
        theme: "dark",
      });
    } else {
      setAttendanceHistorySelected(params);
      modals.modalConfirmDelete.open();
    }
  };

  /** Antes só tinha `.then`: erro (rede, permissão) passava em silêncio (card 11). */
  const handleDeleteRecord = async () => {
    const id = attendanceHistorySelected!.id;
    await executeAsync({
      action: () => deleteAttendanceRecord(token, id),
      loadingMessage: "Excluindo registro...",
      successMessage: "Registro excluído!",
      errorMessage: (e: unknown) =>
        mensagemDeErro(e, "excluir o registro", "Erro ao excluir o registro"),
      onSuccess: () => {
        setAttendanceHistory((prev) => prev.filter((item) => item.id !== id));
        setTotalItems((t) => Math.max(t - 1, 0));
      },
      onFinally: () => modals.modalConfirmDelete.close(),
    });
  };

  const ModalConfirmDelete = () => {
    return !modals.modalConfirmDelete.isOpen ? null : (
      <AlertDialog
        open={modals.modalConfirmDelete.isOpen}
        onOpenChange={(aberto) => {
          if (!aberto) {
            modals.modalConfirmDelete.close();
          }
        }}
      >
        <AlertDialogContent aria-describedby={undefined}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir esse registro?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteRecord}
            >
              Excluir registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const ModalAttendanceRecord = () => {
    return !modals.modalAttendanceRecord.isOpen ? null : (
      <AttendanceRecordModal
        isOpen={modals.modalAttendanceRecord.isOpen}
        handleClose={() => modals.modalAttendanceRecord.close()}
        attendanceId={attendanceHistorySelected!.id}
      />
    );
  };

  const ModalNewAttendanceRecord = () => {
    return !modals.modalNewAttendanceRecord.isOpen ? null : (
      <NewAttendanceRecordModal
        isOpen={modals.modalNewAttendanceRecord.isOpen}
        handleClose={() => modals.modalNewAttendanceRecord.close()}
        classId={classId}
        turmaNome={turmaNome}
        handleNewAttendanceRecord={(res: SimpleAttendanceRecordHistory) => {
          setAttendanceHistory([res, ...attendanceHistory]);
          setTotalItems((t) => t + 1);
        }}
      />
    );
  };

  const ModalAttendanceRecordSummary = () => {
    return !modals.modalAttendanceRecordSummary.isOpen ? null : (
      <AttendanceRecordSummaryModal
        isOpen={modals.modalAttendanceRecordSummary.isOpen}
        handleClose={() => modals.modalAttendanceRecordSummary.close()}
        classId={classId}
        coursePeriodStart={coursePeriodStart}
        coursePeriodEnd={coursePeriodEnd}
      />
    );
  };

  const getAttendanceHistory = async (page: number, limit: number) => {
    getAttendanceRecord(token, page, limit, classId)
      .then((res) => {
        setAttendanceHistory(res.data);
        setTotalItems(res.totalItems);
        setPage(page);
        setCarregou(true);
        setErro(false);
      })
      .catch((err) => {
        setErro(true);
        toast.error(
          mensagemDeErro(
            err,
            "ver as chamadas",
            "Erro ao carregar as chamadas",
          ),
        );
      });
  };

  useEffect(() => {
    getAttendanceHistory(1, limit);
  }, []);

  const ultimaPagina = Math.max(Math.ceil(totalItems / limit), 1);
  const primeiro = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const ultimo = Math.min(page * limit, totalItems);

  const novaChamada = () => modals.modalNewAttendanceRecord.open();

  const estadoDaLista = erro
    ? "error"
    : !carregou
      ? "loading"
      : attendanceHistory.length === 0
        ? "empty"
        : "ready";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        size="md"
        aria-describedby={undefined}
        className="sm:h-[min(640px,calc(100dvh-2rem))]"
      >
        <DialogHeader>
          <DialogTitle>
            Frequência{turmaNome ? ` · ${turmaNome}` : ""}
          </DialogTitle>
          <div className="mt-2 grid grid-cols-1 gap-2 [@media(min-width:420px)]:flex">
            <Button type="button" onClick={novaChamada}>
              <ListPlus aria-hidden="true" />
              Nova chamada
            </Button>
            {permissao[Roles.gerenciarTurmas] && (
              <Button
                type="button"
                variant="outline"
                onClick={() => modals.modalAttendanceRecordSummary.open()}
              >
                <ListTodo aria-hidden="true" />
                Relatório
              </Button>
            )}
          </div>
        </DialogHeader>

        <DialogBody>
          <List
            aria-label="Chamadas"
            state={estadoDaLista}
            loadingRows={5}
            onRetry={() => getAttendanceHistory(page, limit)}
            error={{
              title: "Não foi possível carregar as chamadas.",
              message: "",
            }}
            empty={{
              title: "Nenhuma chamada ainda.",
              hint: "As chamadas registradas desta turma aparecem aqui.",
              action: (
                <Button type="button" onClick={novaChamada}>
                  Fazer a primeira chamada
                </Button>
              ),
            }}
          >
            {attendanceHistory.map((r) => (
              <ListItem
                key={r.id}
                title={dataDaChamada(r.registeredAt)}
                meta={[`por ${r.registeredBy}`]}
                badges={
                  r.period ? (
                    <Badge variant="secondary">
                      {attendancePeriodLabel[r.period as AttendancePeriod]}
                    </Badge>
                  ) : undefined
                }
                trailing={
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setAttendanceHistorySelected(r);
                        modals.modalAttendanceRecord.open();
                      }}
                    >
                      <Eye aria-hidden="true" />
                      Ver
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir"
                      title="Excluir"
                      onClick={() => handleActionDeleteRecord(r)}
                    >
                      <Trash2 />
                    </Button>
                  </>
                }
              />
            ))}
          </List>
          {ModalAttendanceRecord()}
          {ModalNewAttendanceRecord()}
          {ModalConfirmDelete()}
          {ModalAttendanceRecordSummary()}
        </DialogBody>

        {totalItems > limit && (
          <DialogFooter
            status={
              <>
                {primeiro}–{ultimo} de {totalItems}
              </>
            }
          >
            <PaginationControls
              page={page}
              totalPages={ultimaPagina}
              onPageChange={(p) => getAttendanceHistory(p, limit)}
            />
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
