import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
import { deleteAttendanceRecord } from "@/services/prepCourse/attendanceRecord/deleteAttendanceRecord";
import { getAttendanceRecord } from "@/services/prepCourse/attendanceRecord/getAttendanceRecord";
import { useAuthStore } from "@/store/auth";
import { AttendancePeriod, attendancePeriodLabel } from "@/types/partnerPrepCourse/attendancePeriod";
import { SimpleAttendanceRecordHistory } from "@/types/partnerPrepCourse/attendanceRecordHistory";
import { useEffect, useState } from "react";
import { FaRegListAlt } from "react-icons/fa";
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoEyeOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { MdPlaylistAddCircle } from "react-icons/md";
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
  const diaDaSemana = DIAS[
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
      <ModalConfirmCancel
        isOpen={modals.modalConfirmDelete.isOpen}
        handleClose={() => modals.modalConfirmDelete.close()}
        handleConfirm={handleDeleteRecord}
        text="Tem certeza que deseja excluir esse registro?"
        className="bg-white p-4 rounded-md w-[calc(100%-2rem)] max-w-[512px]"
      />
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
          mensagemDeErro(err, "ver as chamadas", "Erro ao carregar as chamadas"),
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

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      closer={false}
      className="bg-white rounded-xl shadow-xl w-[calc(100vw-1rem)] sm:w-[600px] h-[min(640px,calc(100dvh-2rem))] flex flex-col overflow-hidden"
    >
      <div className="shrink-0 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 border-b border-lightGray">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-xl sm:text-2xl font-black text-marine leading-tight">
            Frequência{turmaNome ? ` · ${turmaNome}` : ""}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="shrink-0 -mr-2 -mt-1 p-2 rounded-full text-grey hover:bg-gray-100 hover:text-marine"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 [@media(min-width:420px)]:flex gap-2">
          <button
            type="button"
            onClick={novaChamada}
            className="h-10 px-4 rounded-lg bg-marine text-white font-bold hover:opacity-90 flex items-center justify-center gap-2"
          >
            <MdPlaylistAddCircle className="w-5 h-5" />
            Nova chamada
          </button>
          {permissao[Roles.gerenciarTurmas] && (
            <button
              type="button"
              onClick={() => modals.modalAttendanceRecordSummary.open()}
              className="h-10 px-4 rounded-lg border border-marine/30 text-marine font-bold hover:bg-marine/5 flex items-center justify-center gap-2"
            >
              <FaRegListAlt />
              Relatório
            </button>
          )}
        </div>
      </div>

      <ul aria-label="Chamadas" className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6">
        {erro && (
          <li className="py-10 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-grey">
              Não foi possível carregar as chamadas.
            </p>
            <button
              type="button"
              onClick={() => getAttendanceHistory(page, limit)}
              className="h-10 px-4 rounded-lg border border-marine/30 text-marine font-bold hover:bg-marine/5"
            >
              Tentar de novo
            </button>
          </li>
        )}
        {!carregou &&
          !erro &&
          Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="py-3 border-b border-gray-100 animate-pulse">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-48 rounded bg-gray-100" />
            </li>
          ))}
        {carregou && !erro && attendanceHistory.length === 0 && (
          <li className="h-full flex flex-col items-center justify-center gap-3 text-center py-10">
            <p className="text-marine font-bold">Nenhuma chamada ainda.</p>
            <p className="text-sm text-grey max-w-xs">
              As chamadas registradas desta turma aparecem aqui.
            </p>
            <button
              type="button"
              onClick={novaChamada}
              className="mt-1 h-10 px-4 rounded-lg bg-marine text-white font-bold hover:opacity-90"
            >
              Fazer a primeira chamada
            </button>
          </li>
        )}
        {attendanceHistory.map((r) => (
          <li
            key={r.id}
            className="py-3 border-b border-gray-100 last:border-0 flex flex-wrap items-center gap-x-3 gap-y-1"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-marine font-bold">
                  {dataDaChamada(r.registeredAt)}
                </span>
                {r.period && (
                  <span className="px-2 py-0.5 rounded-full bg-marine/10 text-marine text-xs font-semibold">
                    {attendancePeriodLabel[r.period as AttendancePeriod]}
                  </span>
                )}
              </div>
              <p className="text-sm text-grey truncate">por {r.registeredBy}</p>
            </div>
            <div className="shrink-0 flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setAttendanceHistorySelected(r);
                  modals.modalAttendanceRecord.open();
                }}
                className="h-9 px-3 rounded-lg text-sm font-semibold text-marine hover:bg-marine/5 flex items-center gap-1.5"
              >
                <IoEyeOutline className="w-4 h-4" />
                Ver
              </button>
              <button
                type="button"
                aria-label="Excluir"
                title="Excluir"
                onClick={() => handleActionDeleteRecord(r)}
                className="h-9 w-9 rounded-lg text-grey hover:bg-orange/10 hover:text-orange flex items-center justify-center"
              >
                <IoTrashOutline className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalItems > limit && (
        <div className="shrink-0 px-4 py-2 sm:px-6 border-t border-lightGray flex items-center justify-center gap-3 text-sm text-grey">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => getAttendanceHistory(page - 1, limit)}
            className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
          >
            <IoChevronBack />
          </button>
          <span>
            {primeiro}–{ultimo} de {totalItems}
          </span>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={page >= ultimaPagina}
            onClick={() => getAttendanceHistory(page + 1, limit)}
            className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
          >
            <IoChevronForward />
          </button>
        </div>
      )}
      {ModalAttendanceRecord()}
      {ModalNewAttendanceRecord()}
      {ModalConfirmDelete()}
      {ModalAttendanceRecordSummary()}
    </ModalTemplate>
  );
}
