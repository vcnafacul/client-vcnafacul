import ModalTemplate from "@/components/templates/modalTemplate";
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
import { IoClose, IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";

interface AttendanceRecordProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
  /** Só para o título ("Chamada · Turma A"). */
  turmaNome?: string;
  handleNewAttendanceRecord: (data: SimpleAttendanceRecordHistory) => void;
}

/** `YYYY-MM-DD` no fuso do aparelho — o formato do `<input type="date">`. */
function paraInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Meio-dia local: a api recebe o início do dia em Brasília
 * (`toBrazilStartOfDayISOString`), e meia-noite local num fuso a leste de
 * Brasília cairia no dia anterior.
 */
function doInput(v: string): Date {
  const [a, m, d] = v.split("-").map(Number);
  return new Date(a, m - 1, d, 12);
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
  const [period, setPeriod] = useState<AttendancePeriod>(AttendancePeriod.NOITE);
  const [students, setStudents] = useState<StudentToAttendanceRecord[]>([]);
  const [busca, setBusca] = useState("");
  const [registring, setRegistering] = useState<boolean>(false);
  /** A lista chegou? Antes disso não dá para dizer que está vazia. */
  const [carregou, setCarregou] = useState(false);

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
        setCarregou(true);
      })
      .catch((e) =>
        toast.error(
          mensagemDeErro(e, "fazer a chamada", "Erro ao carregar os alunos da turma"),
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

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      closer={false}
      /*
        ⚠️ Altura limitada à tela (`dvh`): com 670px fixos, no celular (Moto
        Edge 70, Oppo A58) o Confirmar ficava para fora da caixa. Só a lista
        rola; cabeçalho e rodapé ficam sempre visíveis.
      */
      className="bg-white rounded-xl shadow-xl w-[calc(100vw-1rem)] sm:w-[640px] h-[calc(100dvh-2rem)] sm:h-[min(760px,calc(100dvh-4rem))] flex flex-col overflow-hidden"
    >
      {/* Cabeçalho: título, data e período */}
      <div className="shrink-0 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 border-b border-lightGray">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-marine leading-tight">
              Chamada{turmaNome ? ` · ${turmaNome}` : ""}
            </h2>
            <p className="text-sm text-grey mt-0.5 [@media(max-height:700px)]:hidden">
              Marque quem veio. Quem não for marcado fica como ausente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="shrink-0 -mr-2 -mt-1 p-2 rounded-full text-grey hover:bg-gray-100 hover:text-marine"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="shrink-0 flex items-center gap-2 text-sm text-grey">
            <span className="font-semibold sr-only sm:not-sr-only">Data</span>
            <input
              type="date"
              aria-label="Data da chamada"
              value={paraInput(date)}
              max={paraInput(new Date())}
              onChange={(e) => e.target.value && setDate(doInput(e.target.value))}
              className="h-10 w-[9.5rem] px-2 sm:px-3 rounded-lg border border-lightGray text-marine bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            />
          </label>
          <div
            role="radiogroup"
            aria-label="Período"
            className="flex flex-1 min-w-0 rounded-lg bg-gray-100 p-1"
          >
            {Object.values(AttendancePeriod).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={period === p}
                onClick={() => setPeriod(p)}
                className={`flex-1 min-w-0 h-8 rounded-md text-sm font-semibold transition-colors ${
                  period === p
                    ? "bg-white text-marine shadow-sm"
                    : "text-grey hover:text-marine"
                }`}
              >
                {attendancePeriodLabel[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      {carregou && students.length === 0 ? (
        /*
          Turma sem matriculados (antes das matrículas ou no fim do período): a
          api recusa a chamada, então a tela avisa e não deixa confirmar (card 11).
        */
        <div className="flex-1 min-h-0 flex items-center justify-center text-center text-grey px-6">
          Esta turma não tem alunos matriculados.
        </div>
      ) : (
        <>
          <div className="shrink-0 px-4 sm:px-6 py-2 flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-grey w-4 h-4" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar aluno"
                aria-label="Buscar aluno"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-lightGray text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              />
            </div>
            <button
              type="button"
              onClick={alternarTodos}
              disabled={!carregou}
              className="shrink-0 h-10 px-3 rounded-lg text-sm font-semibold text-marine border border-marine/30 hover:bg-marine/5 disabled:opacity-50"
            >
              {todosPresentes ? "Desmarcar todos" : "Todos presentes"}
            </button>
          </div>

          <ul
            aria-label="Alunos"
            className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6"
          >
            {!carregou &&
              Array.from({ length: 6 }, (_, i) => (
                <li
                  key={i}
                  className="py-3 border-b border-gray-100 flex items-center gap-3 animate-pulse"
                >
                  <div className="h-4 flex-1 rounded bg-gray-100" />
                  <div className="h-9 w-40 rounded-full bg-gray-100" />
                </li>
              ))}
            {carregou && visiveis.length === 0 && (
              <li className="py-8 text-center text-sm text-grey">
                Nenhum aluno encontrado para “{busca}”.
              </li>
            )}
            {visiveis.map((s) => {
              const presente = presentes.has(s.id);
              return (
                <li
                  key={s.id}
                  className="py-2.5 border-b border-gray-100 last:border-0 flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-marine font-medium leading-snug break-words">
                      {s.name}
                    </p>
                    <p className="text-xs text-grey">{s.cod_enrolled}</p>
                  </div>
                  <div
                    role="group"
                    aria-label={s.name}
                    className="shrink-0 flex gap-1 sm:gap-1.5"
                  >
                    <button
                      type="button"
                      aria-pressed={presente}
                      onClick={() => marcar(s.id, true)}
                      className={`h-9 px-2.5 sm:px-4 rounded-full text-[13px] sm:text-sm font-bold border transition-colors ${
                        presente
                          ? "bg-marine border-marine text-white"
                          : "bg-white border-lightGray text-grey hover:border-marine hover:text-marine"
                      }`}
                    >
                      Presente
                    </button>
                    <button
                      type="button"
                      aria-pressed={!presente}
                      onClick={() => marcar(s.id, false)}
                      className={`h-9 px-2.5 sm:px-4 rounded-full text-[13px] sm:text-sm font-bold border transition-colors ${
                        !presente
                          ? "bg-orange/5 border-orange text-orange"
                          : "bg-white border-lightGray text-grey hover:border-orange hover:text-orange"
                      }`}
                    >
                      Ausente
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Rodapé */}
      <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-lightGray flex flex-col gap-2 [@media(min-width:420px)]:flex-row [@media(min-width:420px)]:items-center">
        <p className="text-sm text-grey flex-1" aria-live="polite">
          {carregou && students.length > 0 && (
            <>
              <strong className="text-marine">{presentes.size}</strong>{" "}
              {presentes.size === 1 ? "presente" : "presentes"} ·{" "}
              <strong className="text-orange">{ausentes}</strong>{" "}
              {ausentes === 1 ? "ausente" : "ausentes"}
            </>
          )}
        </p>
        <button
          type="button"
          onClick={handleCreateAttendancerecord}
          className="h-11 px-6 rounded-lg bg-marine text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={registring || !carregou || students.length === 0}
        >
          Registrar chamada
        </button>
      </div>
    </ModalTemplate>
  );
}
