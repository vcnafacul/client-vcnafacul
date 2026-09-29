import { useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Prova } from "@/dtos/prova/prova";
import { duplicarProvaCursinho } from "@/services/prova/duplicarProvaCursinho";

type Props = {
  prova: Prova;
  token: string;
  isOpen: boolean;
  handleClose: () => void;
  onDuplicada: (nova: Prova) => void;
};

/** Duplicar prova do cursinho (tickets/027, card 03). */
export function ModalDuplicarProva({
  prova,
  token,
  isOpen,
  handleClose,
  onDuplicada,
}: Props) {
  const [nome, setNome] = useState(`${prova.nome} (cópia)`);
  const [duplicando, setDuplicando] = useState(false);

  const duplicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Dê um nome para a nova prova.");
      return;
    }
    setDuplicando(true);
    try {
      const nova = await duplicarProvaCursinho(prova._id, nome.trim(), token);
      toast.success(`Prova duplicada: ${nova.nome}`);
      onDuplicada(nova);
    } catch (err) {
      // 409 (nome em uso) e 403 chegam com a mensagem da api; o modal fica.
      toast.error(err instanceof Error ? err.message : "Erro ao duplicar a prova");
    } finally {
      setDuplicando(false);
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-full max-w-lg rounded-lg bg-white shadow-xl p-2"
    >
      <form onSubmit={duplicar} className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-marine">Duplicar prova</h2>
        <p className="text-sm text-gray-600">
          Nova prova a partir de <strong>{prova.nome}</strong>.
        </p>
        <div>
          <label htmlFor="nome-da-copia" className="block text-sm font-semibold mb-1">
            Nome da nova prova
          </label>
          <input
            id="nome-da-copia"
            value={nome}
            maxLength={200}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div role="note" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 space-y-1">
          <p>
            As questões serão <strong>as mesmas</strong> da prova original — corrigir
            uma questão vale para as duas.
          </p>
          <p>A ordem é de cada prova: trocar o número numa não muda a outra.</p>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={duplicando}
            className="px-4 py-2 bg-marine text-white rounded-lg disabled:opacity-60"
          >
            {duplicando ? "Duplicando..." : "Duplicar"}
          </button>
        </div>
      </form>
    </ModalTemplate>
  );
}
