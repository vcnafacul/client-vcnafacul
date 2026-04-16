import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { useModals } from "@/hooks/useModal";
import { deletePeriodJustification } from "@/services/prepCourse/periodJustification/deletePeriodJustification";
import { getPeriodJustifications } from "@/services/prepCourse/periodJustification/getPeriodJustifications";
import { useAuthStore } from "@/store/auth";
import { PeriodJustification } from "@/types/partnerPrepCourse/periodJustification";
import { useEffect, useState } from "react";
import { IoChevronDown, IoChevronUp, IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

interface PeriodJustificationListProps {
  studentCourseId: string;
  refreshTrigger: number;
}

const LIMIT = 5;

export function PeriodJustificationList({
  studentCourseId,
  refreshTrigger,
}: PeriodJustificationListProps) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<PeriodJustification[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const modals = useModals(["modalConfirmDelete"]);

  const {
    data: { token },
  } = useAuthStore();

  // Fetch only count (page=1, limit=1) to show in the header even when collapsed
  const fetchCount = async () => {
    try {
      const res = await getPeriodJustifications(token, 1, 1, studentCourseId);
      setTotalItems(res.totalItems);
    } catch (err) {
      // silently ignore count errors
    }
  };

  const fetchPage = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await getPeriodJustifications(
        token,
        targetPage,
        LIMIT,
        studentCourseId
      );
      setItems(res.data);
      setTotalItems(res.totalItems);
      setPage(targetPage);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message ?? "Erro ao carregar justificativas");
    } finally {
      setLoading(false);
    }
  };

  // Always fetch count on mount and when refreshTrigger changes
  useEffect(() => {
    fetchCount();
    if (expanded) {
      fetchPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // When expanded for the first time, fetch paginated list
  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      fetchPage(1);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deletePeriodJustification(token, selectedId);
      toast.success("Justificativa excluída com sucesso!");
      modals.modalConfirmDelete.close();
      setSelectedId(null);
      // Re-fetch to update list and count
      const newPage = items.length === 1 && page > 1 ? page - 1 : page;
      await fetchPage(newPage);
      if (!expanded) {
        await fetchCount();
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message ?? "Erro ao excluir justificativa");
      modals.modalConfirmDelete.close();
    }
  };

  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    modals.modalConfirmDelete.open();
  };

  const totalPages = Math.ceil(totalItems / LIMIT);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR");
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700"
      >
        <span>Justificativas de Período ({totalItems})</span>
        {expanded ? (
          <IoChevronUp className="w-4 h-4" />
        ) : (
          <IoChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="flex flex-col gap-2 p-4">
          {loading && (
            <p className="text-sm text-gray-400 text-center py-2">
              Carregando...
            </p>
          )}

          {!loading && items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              Nenhuma justificativa encontrada.
            </p>
          )}

          {!loading &&
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between border rounded-md p-3 gap-2 bg-white"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-marine">
                    {formatDate(item.startDate)} — {formatDate(item.endDate)}
                  </span>
                  <p className="text-sm text-gray-700 break-words">
                    {item.justification}
                  </p>
                  <span className="text-xs text-gray-400">
                    Criado por: {item.createdBy?.name ?? "—"} em{" "}
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openDeleteModal(item.id)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0 mt-0.5"
                  title="Excluir justificativa"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>
            ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => fetchPage(page - 1)}
                disabled={page <= 1 || loading}
                className="px-3 py-1 text-xs rounded border disabled:opacity-40 hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => fetchPage(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-3 py-1 text-xs rounded border disabled:opacity-40 hover:bg-gray-100"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {modals.modalConfirmDelete.isOpen && (
        <ModalConfirmCancel
          isOpen={modals.modalConfirmDelete.isOpen}
          handleClose={() => {
            modals.modalConfirmDelete.close();
            setSelectedId(null);
          }}
          handleConfirm={handleDelete}
          text="Tem certeza que deseja excluir esta justificativa de período?"
        />
      )}
    </div>
  );
}
