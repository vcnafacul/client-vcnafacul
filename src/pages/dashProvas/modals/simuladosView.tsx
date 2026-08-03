import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { useState } from "react";
import { SimuladoResumo } from "../../../dtos/prova/prova";
import { formatDateTime } from "../../../utils/date";
import { getStatus, isSemJanela } from "../../../utils/simuladoAvailability";
import EditDisponibilidadeModal from "./editDisponibilidadeModal";

interface SimuladosViewProps {
  simulados: SimuladoResumo[] | undefined;
  loading: boolean;
  error: string | null;
  token: string;
  onVoltar: () => void;
  onRetry: () => void;
  onSimuladoUpdated: (updated: SimuladoResumo) => void;
}

function renderStatus(simulado: SimuladoResumo) {
  const status = getStatus(simulado);
  switch (status) {
    case "bloqueado":
      return <span className="text-gray-600">🔒 Aprovação pendente</span>;
    case "antes_da_janela":
      return (
        <span className="text-yellow-700">
          🟡 Abre em {formatDateTime(simulado.disponivelDe)}
        </span>
      );
    case "depois_da_janela":
      return (
        <span className="text-red-700">
          🔴 Expirou em {formatDateTime(simulado.disponivelAte)}
        </span>
      );
    default:
      return isSemJanela(simulado) ? (
        <span className="text-gray-500">⚪ Sem janela</span>
      ) : (
        <span className="text-green-700">🟢 Disponível</span>
      );
  }
}

function SimuladosView({
  simulados,
  loading,
  error,
  token,
  onVoltar,
  onRetry,
  onSimuladoUpdated,
}: SimuladosViewProps) {
  const [editing, setEditing] = useState<SimuladoResumo | null>(null);

  return (
    <div>
      <button
        onClick={onVoltar}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar aos detalhes
      </button>

      <h3 className="text-sm font-medium text-gray-700 mb-4">Simulados</h3>

      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-8 rounded" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600 mb-3">
            Não foi possível carregar os simulados.
          </p>
          <Button variant="outlined" size="small" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!loading && !error && simulados?.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          Esta prova ainda não tem simulados cadastrados.
        </p>
      )}

      {!loading && !error && simulados && simulados.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Questões</th>
                <th className="px-3 py-2">Disponível de</th>
                <th className="px-3 py-2">Disponível até</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {simulados.map((simulado) => (
                <tr key={simulado._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {simulado.nome}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {simulado.categoria?.nome ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {simulado.questoesNovo?.length ?? 0}/
                    {simulado.categoria?.quantidadeTotalQuestao ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {formatDateTime(simulado.disponivelDe) || "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {formatDateTime(simulado.disponivelAte) || "—"}
                  </td>
                  <td className="px-3 py-2">{renderStatus(simulado)}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setEditing(simulado)}
                      className="text-gray-400 hover:text-blue-600"
                      aria-label="Editar janela"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditDisponibilidadeModal
          simulado={editing}
          token={token}
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            onSimuladoUpdated(updated);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

export default SimuladosView;
