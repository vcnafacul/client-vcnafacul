import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, IconButton, Tooltip } from "@mui/material";
import { FiEye, FiEdit3 } from "react-icons/fi";
import { useAuthStore } from "@/store/auth";
import { EssayListItem, EssayTheme } from "@/dtos/essay";
import { getAllEssays, getMyCursinhoEssays, getThemes } from "@/services/essay";
import { ESSAY_REVIEW_LIST, ESSAY_REVIEW_CURSINHO } from "@/routes/path";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Aguardando revisão",
  REVIEWED: "Corrigida",
};

interface Props {
  mode: "admin" | "cursinho";
}

export default function EssayReviewList({ mode }: Props) {
  const navigate = useNavigate();
  const { data: { token, user } } = useAuthStore();
  const [essays, setEssays] = useState<EssayListItem[]>([]);
  const [themes, setThemes] = useState<EssayTheme[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    themeId?: string;
    status?: string;
    search?: string;
  }>({});

  const limit = 20;

  const detailBasePath =
    mode === "admin"
      ? `/dashboard/${ESSAY_REVIEW_LIST}`
      : `/dashboard/${ESSAY_REVIEW_CURSINHO}`;

  const fetchEssays = useCallback(async () => {
    try {
      const fetcher = mode === "admin" ? getAllEssays : getMyCursinhoEssays;
      const result = await fetcher(token, page, limit, filters);
      setEssays(result.data);
      setTotal(result.total);
    } catch {
      toast.error("Erro ao carregar redações");
    } finally {
      setLoading(false);
    }
  }, [token, page, filters, mode]);

  useEffect(() => {
    fetchEssays();
  }, [fetchEssays]);

  useEffect(() => {
    getThemes(token, 1, 100)
      .then((res) => setThemes(res.data))
      .catch(() => {});
  }, [token]);

  const totalPages = Math.ceil(total / limit);

  const title =
    mode === "admin"
      ? "Revisão de Redações"
      : "Redações do Cursinho";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-marine mb-6">{title}</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value || undefined }))
          }
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          onChange={(e) =>
            setFilters((f) => ({ ...f, themeId: e.target.value || undefined }))
          }
        >
          <option value="">Todos os temas</option>
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value || undefined }))
          }
        >
          <option value="">Todos os status</option>
          <option value="SUBMITTED">Aguardando revisão</option>
          <option value="REVIEWED">Corrigida</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-6">Carregando...</div>
      ) : essays.length === 0 ? (
        <div className="text-center py-6 text-grey">
          Nenhuma redação encontrada.
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-grey">Estudante</th>
                  <th className="text-left p-3 text-sm font-semibold text-grey">Email</th>
                  <th className="text-left p-3 text-sm font-semibold text-grey">Tema</th>
                  <th className="text-left p-3 text-sm font-semibold text-grey">Data envio</th>
                  <th className="text-left p-3 text-sm font-semibold text-grey">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-grey">Reviews</th>
                  <th className="text-left p-3 text-sm font-semibold text-grey">Ações</th>
                </tr>
              </thead>
              <tbody>
                {essays.map((e) => (
                  <tr key={e.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {e.user.firstName} {e.user.lastName}
                    </td>
                    <td className="p-3 text-sm text-grey">{e.user.email}</td>
                    <td className="p-3 text-sm">{e.theme.title}</td>
                    <td className="p-3 text-sm text-grey">
                      {e.submittedAt
                        ? new Date(e.submittedAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="p-3 text-sm">
                      {STATUS_LABELS[e.status] ?? e.status}
                    </td>
                    <td className="p-3 text-sm font-bold text-marine">
                      {e.reviews?.length ?? 0}
                    </td>
                    <td className="p-3">
                      <Box className="flex gap-1">
                        <Tooltip title="Ver redação" arrow>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`${detailBasePath}/${e.id}/ver`)}
                            sx={{ color: "primary.main" }}
                          >
                            <FiEye className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        {(e.status === "SUBMITTED" || e.status === "REVIEWED") &&
                          !e.reviews?.some(
                            (r) => r.reviewType === "HUMAN" && r.reviewer?.email === user.email
                          ) && (
                          <Tooltip title="Revisar" arrow>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${detailBasePath}/${e.id}`)}
                              sx={{ color: "warning.main" }}
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
