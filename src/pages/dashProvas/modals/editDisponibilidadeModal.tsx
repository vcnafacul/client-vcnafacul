import ModalTemplate from "@/components/templates/modalTemplate";
import { useToastAsync } from "@/hooks/useToastAsync";
import { Button } from "@mui/material";
import { useState } from "react";
import { SimuladoResumo } from "../../../dtos/prova/prova";
import { updateDisponibilidade } from "../../../services/simulado/updateDisponibilidade";
import { toDatetimeLocalValue } from "../../../utils/date";

interface EditDisponibilidadeModalProps {
  simulado: SimuladoResumo;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: SimuladoResumo) => void;
}

function EditDisponibilidadeModal({
  simulado,
  token,
  isOpen,
  onClose,
  onSaved,
}: EditDisponibilidadeModalProps) {
  const executeAsync = useToastAsync();
  const [de, setDe] = useState(toDatetimeLocalValue(simulado.disponivelDe));
  const [ate, setAte] = useState(toDatetimeLocalValue(simulado.disponivelAte));
  const [erro, setErro] = useState<string | null>(null);

  const handleSalvar = async () => {
    const deDate = de ? new Date(de) : null;
    const ateDate = ate ? new Date(ate) : null;

    if (deDate && ateDate && deDate >= ateDate) {
      setErro("O início precisa ser antes do fim.");
      return;
    }
    setErro(null);

    await executeAsync({
      action: () =>
        updateDisponibilidade(
          simulado._id,
          { disponivelDe: deDate, disponivelAte: ateDate },
          token,
        ),
      loadingMessage: "Salvando janela...",
      successMessage: "Janela de disponibilidade atualizada",
      errorMessage: (error) => error.message,
      onSuccess() {
        onSaved({
          ...simulado,
          disponivelDe: deDate ? deDate.toISOString() : null,
          disponivelAte: ateDate ? ateDate.toISOString() : null,
        });
        onClose();
      },
    });
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={onClose}
      className="w-full max-w-md rounded-lg bg-white shadow-xl p-6"
      style={{ zIndex: 60 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Editar janela
      </h3>
      <p className="text-sm text-gray-500 mb-4">{simulado.nome}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Disponível de
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={de}
              onChange={(e) => setDe(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
            {de && (
              <button
                type="button"
                onClick={() => setDe("")}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Limpar disponível de"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Disponível até
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
            {ate && (
              <button
                type="button"
                onClick={() => setAte("")}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Limpar disponível até"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSalvar}>
          Salvar
        </Button>
      </div>
    </ModalTemplate>
  );
}

export default EditDisponibilidadeModal;
