import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { SimuladoResumo } from "../../../dtos/prova/prova";

interface SimuladosViewProps {
  simulados: SimuladoResumo[] | undefined;
  loading: boolean;
  error: string | null;
  onVoltar: () => void;
  onRetry: () => void;
}

function SimuladosView({ simulados, loading, error, onVoltar, onRetry }: SimuladosViewProps) {
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
          <p className="text-sm text-red-600 mb-3">Não foi possível carregar os simulados.</p>
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
                <th className="px-3 py-2">Aproveitamento</th>
                <th className="px-3 py-2">Respondido</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {simulados.map((simulado) => (
                <tr key={simulado._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{simulado.nome}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {simulado.categoria?.nome ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {simulado.questoes.length}/{simulado.categoria?.quantidadeTotalQuestao ?? '-'}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {simulado.aproveitamento ?? 0}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {simulado.vezesRespondido ?? 0}x
                  </td>
                  <td className="px-3 py-2">
                    {simulado.bloqueado ? '🔒 Bloqueado' : '✅ Liberado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SimuladosView;
