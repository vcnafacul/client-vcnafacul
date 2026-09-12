import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { SimuladoResumo } from "../../../dtos/prova/prova";
import { baixarCaderno } from "../../../services/caderno/baixarCaderno";
import { baixarCartao } from "../../../services/cartaoResposta/baixarCartao";
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

  // ⚠️ Guarda o `_id` em voo, não um booleano. Um booleano único desabilitaria
  // a tabela INTEIRA, e o coordenador que quer baixar dois simulados
  // esperaria sem motivo.
  const [baixandoCaderno, setBaixandoCaderno] = useState<string | null>(null);

  // Botão de rascunho só existe com a env ligada. Lido uma vez, fora do
  // render: `import.meta.env` é estático no build do Vite.
  const rascunhoHabilitado = import.meta.env.VITE_CADERNO_DRAFT === "true";

  const handleDownloadCaderno = async (
    simulado: SimuladoResumo,
    draft = false,
  ) => {
    // ⚠️ Guarda contra clique repetido. O botão já desabilita, mas entre o
    // clique e o re-render cabe um segundo clique — e gerar o caderno é
    // lento o bastante para essa janela ser real.
    if (baixandoCaderno) return;
    setBaixandoCaderno(simulado._id);

    const id = toast.loading(
      draft ? "Gerando rascunho..." : "Gerando caderno...",
    );
    try {
      const { blob, avisos } = await baixarCaderno(
        simulado._id,
        token,
        draft,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `caderno_${simulado.nome}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ⚠️ Aviso é `warning`, não `success`. O download funcionou, mas há algo
      // para conferir antes de imprimir — e este toast é o canal que devolve a
      // responsabilidade a quem cadastrou a questão. Um success verde faz a
      // pessoa fechar sem ler.
      toast.update(id, {
        render:
          avisos > 0
            ? `Caderno gerado com ${avisos} ${
                avisos === 1 ? "observação" : "observações"
              } — confira as questões marcadas`
            : "Caderno baixado com sucesso!",
        type: avisos > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: avisos > 0 ? 8000 : 3000,
        closeOnClick: true,
      });
    } catch (erro) {
      // ⚠️ A mensagem do backend, não uma genérica. É o fim da corrente que o
      // card 05 consertou.
      toast.update(id, {
        render:
          erro instanceof Error ? erro.message : "Erro ao baixar o caderno",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    } finally {
      setBaixandoCaderno(null);
    }
  };

  const handleDownloadCartao = async (simulado: SimuladoResumo) => {
    const id = toast.loading("Baixando cartão...");
    try {
      const blob = await baixarCartao(simulado._id, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cartao_${simulado.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.update(id, {
        render: "Cartão baixado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch {
      toast.update(id, {
        render: "Erro ao baixar o cartão",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    }
  };

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
                    {simulado.questoes?.length ?? 0}/
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadCartao(simulado)}
                        disabled={simulado.bloqueado}
                        title={
                          simulado.bloqueado
                            ? "Disponível só para simulados prontos"
                            : "Baixar cartão de resposta"
                        }
                        className={
                          simulado.bloqueado
                            ? "text-gray-200 cursor-not-allowed"
                            : "text-gray-400 hover:text-blue-600"
                        }
                        aria-label="Baixar cartão de resposta"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>

                      {!simulado.bloqueado && (
                        <button
                          onClick={() => handleDownloadCaderno(simulado)}
                          disabled={baixandoCaderno === simulado._id}
                          title="Baixar caderno de questões (pacote .zip para abrir no Overleaf)"
                          className={
                            baixandoCaderno === simulado._id
                              ? "text-gray-200 cursor-wait"
                              : "text-gray-400 hover:text-blue-600"
                          }
                          aria-label="Baixar caderno de questões"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      )}

                      {simulado.bloqueado && rascunhoHabilitado && (
                        <button
                          onClick={() => handleDownloadCaderno(simulado, true)}
                          disabled={baixandoCaderno === simulado._id}
                          title="Baixar rascunho do caderno (sai com marca d'água e a lista de pendências)"
                          className={
                            baixandoCaderno === simulado._id
                              ? "text-gray-200 cursor-wait"
                              : "text-gray-300 hover:text-blue-500"
                          }
                          aria-label="Baixar rascunho do caderno"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      )}

                      {simulado.bloqueado && !rascunhoHabilitado && (
                        <button
                          disabled
                          title="O simulado precisa estar com todas as questões cadastradas, aprovadas e numeradas"
                          className="text-gray-200 cursor-not-allowed"
                          aria-label="Baixar caderno de questões"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setEditing(simulado)}
                        className="text-gray-400 hover:text-blue-600"
                        aria-label="Editar janela"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    </div>
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
