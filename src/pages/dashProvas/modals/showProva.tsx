/* eslint-disable use-isnan */
import ModalTemplate from "@/components/templates/modalTemplate";
import { useAuthStore } from "@/store/auth";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import { Prova } from "../../../dtos/prova/prova";
import { getProvaFile } from "../../../services/prova/getFile";
import { useEffect, useState } from "react";
import { useToastAsync } from "@/hooks/useToastAsync";
import { updateProvaFiles } from "@/services/prova/updateProvaFiles";
import { getProvaById } from "../../../services/prova/getProvaById";
import SimuladosView from "./simuladosView";
import UploadButton from "../../../components/molecules/uploadButton";

interface ShowProvaProps {
  prova: Prova;
  isOpen: boolean;
  handleClose: () => void;
  onUpdated?: (prova: Prova) => void;
}

function ShowProva({ prova, isOpen, handleClose, onUpdated }: ShowProvaProps) {
  const executeAsync = useToastAsync();
  const [isEditingFiles, setIsEditingFiles] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newGabarito, setNewGabarito] = useState<File | null>(null);

  type ShowProvaView = 'details' | 'simulados';
  const [view, setView] = useState<ShowProvaView>('details');
  const [fullProva, setFullProva] = useState<Prova | null>(null);
  const [loadingSimulados, setLoadingSimulados] = useState(false);
  const [errorSimulados, setErrorSimulados] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const percentCadastradas =
    (prova.totalQuestaoCadastradas / prova.totalQuestao) * 100;
  const percentValidadas =
    (prova.totalQuestaoValidadas / prova.totalQuestaoCadastradas) * 100;

  const {
    data: { token },
  } = useAuthStore();

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingSimulados(true);
    setErrorSimulados(null);
    getProvaById(prova._id, token)
      .then(data => { if (!cancelled) setFullProva(data); })
      .catch(err => { if (!cancelled) setErrorSimulados(err.message); })
      .finally(() => { if (!cancelled) setLoadingSimulados(false); });
    return () => { cancelled = true; };
  }, [isOpen, prova._id, token, retryCount]);

  useEffect(() => {
    if (!isOpen) setView('details');
  }, [isOpen]);

const downloadFile = async (filename: string, fileType: string) => {
  const id = toast.loading(`Baixando ${fileType}...`);

  try {
    const blob = await getProvaFile(filename, token);

    // Criar URL do blob e fazer download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${prova.nome}_${fileType}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.update(id, {
      render: `Download d${fileType == "prova" ? "a" : "o"} ${fileType} concluído com sucesso!`,
      type: "success",
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
    });
  } catch (error) {
    toast.update(id, {
      render: `Erro ao baixar o ${fileType}`,
      type: "error",
      isLoading: false,
      autoClose: 5000,
      closeOnClick: true,
    });
  }
};

  const handleDownloadProva = () => {
    downloadFile(prova.filename, "prova");
  };

  const handleDownloadGabarito = () => {
    downloadFile(prova.gabarito, "gabarito");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleGabaritoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewGabarito(e.target.files[0]);
    }
  };

  const handleFileRemove = (_: any) => {
    setNewFile(null);
  };

  const handleGabaritoRemove = (_: any) => {
    setNewGabarito(null);
  };

  const handleUpdateFiles = async () => {
    if (!newFile && !newGabarito) return;

    const formData = new FormData();

    if (newFile) {
      formData.append("file", newFile);
    }

    if (newGabarito) {
      formData.append("gabarito", newGabarito);
    }

    await executeAsync({
      action: () => updateProvaFiles(prova._id, formData, token),
      loadingMessage: "Atualizando arquivos...",
      successMessage: "Arquivos atualizados com sucesso",
      errorMessage: (error) => error.message,
      onSuccess(updatedProva) {
        onUpdated?.(updatedProva);
        setIsEditingFiles(false);
        setNewFile(null);
        setNewGabarito(null);
      },
    });
  };


  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-full max-w-2xl rounded-lg bg-white shadow-xl p-2"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {prova.nome}
              </h2>
              <p className="text-sm text-gray-500">Detalhes da Prova</p>
            </div>
          </div>
        </div>

        {view === 'details' ? (
          <>
            {/* Informações Básicas */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <AcademicCapIcon className="h-4 w-4" />
                Informações Gerais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Edição</p>
                  <p className="text-sm font-medium text-gray-900">{prova.edicao}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ano</p>
                  <p className="text-sm font-medium text-gray-900">{prova.ano}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Aplicação</p>
                  <p className="text-sm font-medium text-gray-900">{prova.aplicacao}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Categoria</p>
                  <p className="text-sm font-medium text-gray-900">{prova.categoria?.nome ?? '—'}</p>
                  {prova.categoria?.exame?.nome && (
                    <p className="text-xs text-gray-500 mt-0.5">{prova.categoria.exame.nome}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Métricas de Progresso */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                Progresso das Questões
              </h3>

              <div className="space-y-4">
                {/* Questões Esperadas */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Questões Esperadas
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {prova.totalQuestao}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>

                {/* Questões Cadastradas */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-900">
                      Questões Cadastradas
                    </span>
                    <span className="text-lg font-bold text-yellow-900">
                      {prova.totalQuestaoCadastradas} (
                      {percentCadastradas.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        percentCadastradas
                      )}`}
                      style={{ width: `${Math.min(percentCadastradas, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Questões Aprovadas */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900">
                      Questões Aprovadas
                    </span>
                    <span className="text-lg font-bold text-green-900">
                      {prova.totalQuestaoValidadas} (
                      {isNaN(percentValidadas) ? "0" : percentValidadas.toFixed(1)}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        isNaN(percentValidadas) ? 0 : percentValidadas
                      )}`}
                      style={{
                        width: `${Math.min(
                          isNaN(percentValidadas) ? 0 : percentValidadas,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Download */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {!isEditingFiles ? (
                <>
                  <Button
                    onClick={() => setView('simulados')}
                    variant="outlined"
                    color="primary"
                    sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <TableCellsIcon className="h-4 w-4" />
                    Ver simulados
                  </Button>

                  {prova.gabarito && (
                    <Button
                      onClick={handleDownloadGabarito}
                      variant="contained"
                      sx={{
                        backgroundColor: "#6b7280",
                        "&:hover": {
                          backgroundColor: "#4b5563",
                        },
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Download do Gabarito
                    </Button>
                  )}

                  <Button
                    onClick={handleDownloadProva}
                    variant="contained"
                    color="primary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download da Prova
                  </Button>

                  <Button
                    onClick={() => setIsEditingFiles(true)}
                    size="small"
                  >
                    <PencilSquareIcon className="size-8" />
                  </Button>
                </>
              ) : (
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UploadButton
                      onChange={handleFileUpload}
                      placeholder="Substituir Prova"
                      accept=".pdf"
                      variant="compact"
                      onRemove={handleFileRemove}
                    />

                    <UploadButton
                      onChange={handleGabaritoUpload}
                      placeholder={prova.gabarito ? "Substituir Gabarito" : "Adicionar Gabarito"}
                      accept=".pdf"
                      variant="compact"
                      onRemove={handleGabaritoRemove}
                    />
                  </div>

                  <div className="flex justify-end mt-4 gap-3">
                    <Button
                      onClick={() => {
                        setIsEditingFiles(false);
                        setNewFile(null);
                        setNewGabarito(null);
                      }}
                      variant="outlined"
                    >
                      Cancelar
                    </Button>

                    <Button
                      onClick={handleUpdateFiles}
                      disabled={!newFile && !newGabarito}
                      variant="contained"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <SimuladosView
            simulados={fullProva?.simulados}
            loading={loadingSimulados}
            error={errorSimulados}
            token={token}
            onVoltar={() => setView('details')}
            onRetry={() => setRetryCount(c => c + 1)}
            onSimuladoUpdated={(updated) =>
              setFullProva((prev) =>
                prev
                  ? {
                      ...prev,
                      simulados: prev.simulados?.map((s) =>
                        s._id === updated._id ? updated : s,
                      ),
                    }
                  : prev,
              )
            }
          />
        )}
        </div>
    </ModalTemplate>
  );
}

export default ShowProva;
