import { useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { ResultadosCartao } from "../../../dtos/cartaoResposta/resultados";
import { buscarResultados } from "../../../services/cartaoResposta/buscarResultados";
import { uploadCartao } from "../../../services/cartaoResposta/uploadCartao";

interface UploadCartaoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  token: string;
}

export default function UploadCartaoModal({
  isOpen,
  handleClose,
  token,
}: UploadCartaoModalProps) {
  const [matricula, setMatricula] = useState("");
  const [resultado, setResultado] = useState<ResultadosCartao | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const reset = () => {
    setMatricula("");
    setResultado(null);
    setFile(null);
  };

  const fechar = () => {
    reset();
    handleClose();
  };

  const handleBuscar = async () => {
    if (!matricula.trim()) return;
    setBuscando(true);
    try {
      setResultado(await buscarResultados(matricula.trim(), token));
    } catch (err) {
      setResultado(null);
      toast.error((err as Error).message);
    } finally {
      setBuscando(false);
    }
  };

  const handleEnviar = async () => {
    if (!resultado || !file) return;
    setEnviando(true);
    const id = toast.loading("Enviando cartão...");
    try {
      await uploadCartao(file, resultado.estudante.userId, token);
      toast.update(id, {
        render: "Cartão enviado! Processando...",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      fechar();
    } catch (err) {
      toast.update(id, {
        render: (err as Error).message || "Erro ao enviar o cartão",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={fechar}
      className="w-full max-w-lg rounded-lg bg-white shadow-xl p-2"
    >
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Enviar cartão de resposta</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Matrícula do aluno"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleBuscar}
            disabled={buscando}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {resultado && (
          <div className="space-y-3">
            <div className="border rounded p-3">
              <p className="font-medium">{resultado.estudante.nome}</p>
              <p className="text-sm text-gray-500">
                Matrícula: {resultado.estudante.matricula}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">
                Últimos resultados: {resultado.historicos.length}
              </p>
              <ul className="text-sm max-h-32 overflow-auto divide-y">
                {resultado.historicos.map((h, i) => (
                  <li key={i} className="py-1 flex justify-between">
                    <span>{h.ano ?? "—"}</span>
                    <span className="text-gray-500">{h.status ?? ""}</span>
                  </li>
                ))}
              </ul>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <button
              onClick={handleEnviar}
              disabled={!file || enviando}
              className="w-full px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar cartão"}
            </button>
          </div>
        )}
      </div>
    </ModalTemplate>
  );
}
