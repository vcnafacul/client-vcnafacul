import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Duplicar prova</DialogTitle>
          <DialogDescription>
            Nova prova a partir de <strong>{prova.nome}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-duplicar-prova"
          onSubmit={duplicar}
          className="space-y-4"
        >
          <div>
            <label htmlFor="nome-da-copia" className="block text-body font-semibold mb-1">
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
          <div role="note" className="rounded-lg bg-warning-muted p-3 text-body text-foreground space-y-1">
            <p>
              As questões serão <strong>as mesmas</strong> da prova original — corrigir
              uma questão vale para as duas.
            </p>
            <p>A ordem é de cada prova: trocar o número numa não muda a outra.</p>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-duplicar-prova" disabled={duplicando}>
            {duplicando ? "Duplicando..." : "Duplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
