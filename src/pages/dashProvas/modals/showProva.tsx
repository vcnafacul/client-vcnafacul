/* eslint-disable use-isnan */
import ModalTemplate from "@/components/templates/modalTemplate";
import { useAuthStore } from "@/store/auth";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import PropValue from "../../../components/molecules/PropValue";
import { Prova } from "../../../dtos/prova/prova";
import { getProvaFile } from "../../../services/prova/getFile";

interface ShowProvaProps {
  prova: Prova;
  isOpen: boolean;
  handleClose: () => void;
}

function ShowProva({ prova, isOpen, handleClose }: ShowProvaProps) {
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

  const downloadFile = async (filename: string, fileType: string) => {
    const id = toast.loading(`Baixando prova...`);
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
      toast.dismiss(id);
    } catch (error) {
      toast.error(`Erro ao baixar o ${fileType}`);
    }
  };

  const handleDownloadProva = () => {
    downloadFile(prova.filename, "prova");
  };

  const handleDownloadGabarito = () => {
    downloadFile(prova.gabarito, "gabarito");
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

        {/* Informações Básicas */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <AcademicCapIcon className="h-4 w-4" />
            Informações Gerais
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <PropValue prop="Edição" value={prova.edicao} />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <PropValue prop="Ano" value={prova.ano.toString()} />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <PropValue prop="Aplicação" value={prova.aplicacao.toString()} />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <PropValue prop="Exame" value={prova.exame} />
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
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ShowProva;
