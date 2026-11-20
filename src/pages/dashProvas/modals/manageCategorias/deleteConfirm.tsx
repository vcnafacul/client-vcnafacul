import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ICategoria } from "../../../../dtos/categoria/categoria";
import { useToastAsync } from "../../../../hooks/useToastAsync";

interface DeleteConfirmProps {
  categoria: ICategoria;
  token: string;
  /** ⚠️ Vem resolvido do `ManageCategorias` — admin ou cursinho. */
  excluirService: (id: string, token: string) => Promise<void>;
  onDeleted: (id: string) => void;
  onCancel: () => void;
}

function DeleteConfirm({
  categoria,
  token,
  excluirService,
  onDeleted,
  onCancel,
}: DeleteConfirmProps) {
  const execute = useToastAsync();
  const [excluindo, setExcluindo] = useState(false);

  const handleExcluir = async () => {
    setExcluindo(true);
    await execute({
      action: () => excluirService(categoria._id, token),
      loadingMessage: "Excluindo categoria...",
      successMessage: "Categoria excluída",
      // A service já monta a mensagem do 409 com a contagem de simulados.
      errorMessage: (err: Error) => err.message,
      onSuccess: () => onDeleted(categoria._id),
      onError: () => onCancel(),
      onFinally: () => setExcluindo(false),
    });
  };

  return (
    <div>
      <p className="text-body text-foreground">
        Excluir a categoria{" "}
        <span className="font-semibold">&quot;{categoria.nome}&quot;</span>?
      </p>
      <p className="mt-1 text-body text-muted-foreground">
        Esta ação não pode ser desfeita.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={excluindo}
          onClick={handleExcluir}
        >
          Excluir
        </Button>
      </div>
    </div>
  );
}

export default DeleteConfirm;
