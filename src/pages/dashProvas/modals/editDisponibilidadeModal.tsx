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
      <h3 className="text-h3 font-semibold text-foreground mb-1">
        Editar janela
      </h3>
      <p className="text-body text-muted-foreground mb-4">{simulado.nome}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-body text-foreground mb-1">
            Disponível de
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={de}
              onChange={(e) => setDe(e.target.value)}
              className="border border-border rounded px-2 py-1 text-body w-full"
            />
            {de && (
              <button
                type="button"
                onClick={() => setDe("")}
                className="text-muted-foreground hover:text-foreground text-h3"
                aria-label="Limpar disponível de"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-body text-foreground mb-1">
            Disponível até
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
              className="border border-border rounded px-2 py-1 text-body w-full"
            />
            {ate && (
              <button
                type="button"
                onClick={() => setAte("")}
                className="text-muted-foreground hover:text-foreground text-h3"
                aria-label="Limpar disponível até"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {erro && <p className="text-body text-destructive">{erro}</p>}
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
