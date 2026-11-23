import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { List, ListItem } from "@/components/ui/list";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatarData } from "@/lib/datasBr";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createAttendanceRecord } from "@/services/prepCourse/attendanceRecord/createAttendanceRecord";
import { getStudentsToAttendanceRecord } from "@/services/prepCourse/attendanceRecord/getStudentToAttendanceRecord";
import { useAuthStore } from "@/store/auth";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
import {
  AttendancePeriod,
  attendancePeriodLabel,
} from "@/types/partnerPrepCourse/attendancePeriod";
import { SimpleAttendanceRecordHistory } from "@/types/partnerPrepCourse/attendanceRecordHistory";
import { StudentToAttendanceRecord } from "@/types/partnerPrepCourse/classToAttendanceRecord";
import { useEffect, useMemo, useState } from "react";
import { Search, TriangleAlert } from "lucide-react";
import { toast } from "@/lib/toast";
import {
  AlertaEvasaoDaTurma,
  justificadoNaData,
  riscoDeEvasao,
} from "./riscoDeEvasao";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
  /** Só para o título ("Chamada · Turma A"). */
  turmaNome?: string;
  handleNewAttendanceRecord: (data: SimpleAttendanceRecordHistory) => void;
}

/** Busca sem acento e sem caixa: "joao" acha "João". */
const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function NewAttendanceRecordModal({
  isOpen,
  handleClose,
  classId,
  turmaNome,
  handleNewAttendanceRecord,
}: AttendanceRecordProps) {
  /** Quem está Presente. Todos começam Ausente (decisão de 2026-10-30). */
  const [presentes, setPresentes] = useState<Set<string>>(new Set());
  const [date, setDate] = useState<Date>(new Date());
  const [period, setPeriod] = useState<AttendancePeriod>(
    AttendancePeriod.NOITE,
  );
  const [students, setStudents] = useState<StudentToAttendanceRecord[]>([]);
  const [busca, setBusca] = useState("");
  const [registring, setRegistering] = useState<boolean>(false);
  /** A lista chegou? Antes disso não dá para dizer que está vazia. */
  const [carregou, setCarregou] = useState(false);
  /** `null` = alerta desligado no cursinho (tickets/054, D5). */
  const [alerta, setAlerta] = useState<AlertaEvasaoDaTurma | null>(null);

  const {
    data: {
      token,
      user: { firstName, lastName },
    },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  useEffect(() => {
    getStudentsToAttendanceRecord(token, classId)
      .then((res) => {
        setStudents(res.students);
        setAlerta(res.alertaEvasao ?? null);
        setCarregou(true);
      })
      .catch((e) =>
        toast.error(
          mensagemDeErro(
            e,
            "fazer a chamada",
            "Erro ao carregar os alunos da turma",
          ),
        ),
      );
  }, []);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    const ordenados = [...students].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
    if (!termo) return ordenados;
    return ordenados.filter(
      (s) =>
        normalizar(s.name).includes(termo) || s.cod_enrolled?.includes(termo),
    );
  }, [students, busca]);

  const marcar = (id: string, presente: boolean) =>
    setPresentes((prev) => {
      const novo = new Set(prev);
      if (presente) novo.add(id);
      else novo.delete(id);
      return novo;
    });

  const todosPresentes =
    students.length > 0 && presentes.size === students.length;

  const alternarTodos = () =>
    setPresentes(
      todosPresentes ? new Set() : new Set(students.map((s) => s.id)),
    );

  const handleCreateAttendancerecord = async () => {
    setRegistering(true);
    await executeAsync({
      action: () =>
        createAttendanceRecord(token, classId, date, period, [...presentes]),
      loadingMessage: "Registrando presença...",
      successMessage: "Presença registrada com sucesso!",
      errorMessage: (error: Error) => error.message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (res: any) => {
        handleNewAttendanceRecord({
          id: res.id,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          registeredAt: res.registeredAt,
          period: res.period ?? period,
          registeredBy: firstName + " " + lastName,
        });
        handleClose();
      },
      onFinally: () => {
        setRegistering(false);
      },
    });
  };

  const ausentes = students.length - presentes.size;

  /*
    Risco de evasão (tickets/054, card 04). "Justificado na data" só muda com
    a data; o % de cada linha sai disso em O(1) a cada toque; o resumo é uma
    passada na lista. Com ~30 alunos não precisa memoizar as linhas.
  */
  // O dia da chamada no fuso de São Paulo, como o das justificativas por período.
  const dataDaChamada = formatarData(date, "yyyy-MM-dd");
  const justificados = useMemo(
    () =>
      new Set(
        students
          .filter((s) => justificadoNaData(s, dataDaChamada))
          .map((s) => s.id),
      ),
    [students, dataDaChamada],
  );
  const riscoDe = (s: StudentToAttendanceRecord) =>
    riscoDeEvasao(
      s,
      { presente: presentes.has(s.id), justificado: justificados.has(s.id) },
      alerta,
    );
  const emRisco = alerta
    ? students.filter((s) => riscoDe(s).emRisco).length
    : 0;

  const estadoDaLista = !carregou
    ? "loading"
    : students.length === 0 || visiveis.length === 0
      ? "empty"
      : "ready";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        size="lg"
        // Clique fora não fecha: perderia as marcas. Esc e o X continuam fechando.
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:h-[min(760px,calc(100dvh-4rem))]"
        banner={
          emRisco > 0 ? (
            <Alert
              variant="warning"
              role="status"
              aria-live="polite"
              title={
                <>
                  <strong>{emRisco}</strong>{" "}
                  {emRisco === 1 ? "aluno em risco" : "alunos em risco"} de
                  evasão
                  {/* No celular a faixa cabe numa linha só: o % fica para a tela larga. */}
                  <span className="hidden sm:inline">
                    {" "}
                    (alerta: {alerta?.percentual}%)
                  </span>
                </>
              }
            />
          ) : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Chamada{turmaNome ? ` · ${turmaNome}` : ""}</DialogTitle>
          <DialogDescription className="[@media(max-height:700px)]:hidden">
            Marque quem veio. Quem não for marcado fica como ausente.
          </DialogDescription>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-2 text-body text-muted-foreground">
              <span className="sr-only font-semibold sm:not-sr-only">Data</span>
              <DatePicker
                aria-label={`Data da chamada, ${formatarData(date)}`}
                value={date}
                max={new Date()}
                onChange={(d) => d && setDate(d)}
                className="w-full sm:w-[9.5rem]"
              />
            </div>
            <SegmentedControl
              aria-label="Período"
              fullWidth
              className="min-w-0 flex-1"
              value={period}
              onValueChange={(v) => setPeriod(v as AttendancePeriod)}
              options={Object.values(AttendancePeriod).map((p) => ({
                value: p,
                label: attendancePeriodLabel[p],
              }))}
            />
          </div>

          {carregou && students.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar aluno"
                aria-label="Buscar aluno"
                leading={<Search aria-hidden="true" />}
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={alternarTodos}
                className="shrink-0"
              >
                {todosPresentes ? "Desmarcar todos" : "Todos presentes"}
              </Button>
            </div>
          )}
        </DialogHeader>

        <DialogBody>
          {/*
            Turma sem matriculados (antes das matrículas ou no fim do período): a
            api recusa a chamada, então a tela avisa e não deixa confirmar (card 11).
          */}
          <List
            aria-label="Alunos"
            state={estadoDaLista}
            loadingRows={6}
            empty={{
              title:
                students.length === 0
                  ? "Esta turma não tem alunos matriculados."
                  : `Nenhum aluno encontrado para “${busca}”.`,
            }}
          >
            {visiveis.map((s) => {
              const presente = presentes.has(s.id);
              const risco = riscoDe(s);
              return (
                <ListItem
                  key={s.id}
                  title={s.name}
                  wrapTitle
                  meta={[s.cod_enrolled]}
                  badges={
                    <>
                      {risco.emRisco && (
                        <StatusBadge
                          variant="warning"
                          look="dot"
                          icon={TriangleAlert}
                          value={`${Math.round(risco.percentual)}%`}
                          aria-label={`risco de evasão, ${Math.round(risco.percentual)}% de faltas`}
                        />
                      )}
                      {!presente && justificados.has(s.id) && (
                        <Badge variant="secondary">justificado</Badge>
                      )}
                    </>
                  }
                  trailing={
                    <SegmentedControl
                      size="sm"
                      aria-label={s.name}
                      value={presente ? "presente" : "ausente"}
                      onValueChange={(v) => marcar(s.id, v === "presente")}
                      options={[
                        { value: "presente", label: "Presente" },
                        { value: "ausente", label: "Ausente" },
                      ]}
                    />
                  }
                />
              );
            })}
          </List>
        </DialogBody>

        <DialogFooter
          status={
            carregou && students.length > 0 ? (
              <>
                <strong className="text-foreground">{presentes.size}</strong>{" "}
                {presentes.size === 1 ? "presente" : "presentes"} ·{" "}
                <strong className="text-foreground">{ausentes}</strong>{" "}
                {ausentes === 1 ? "ausente" : "ausentes"}
              </>
            ) : undefined
          }
        >
          <Button
            type="button"
            variant="cta"
            onClick={handleCreateAttendancerecord}
            disabled={registring || !carregou || students.length === 0}
          >
            Registrar chamada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
