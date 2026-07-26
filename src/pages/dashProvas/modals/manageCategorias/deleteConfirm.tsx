import { useState } from "react";
import Button from "../../../../components/molecules/button";
import { ICategoria } from "../../../../dtos/categoria/categoria";
import { useToastAsync } from "../../../../hooks/useToastAsync";
import { deleteCategoria } from "../../../../services/categoria/deleteCategoria";

interface DeleteConfirmProps {
  categoria: ICategoria;
  token: string;
  onDeleted: (id: string) => void;
  onCancel: () => void;
}

function DeleteConfirm({
  categoria,
  token,
  onDeleted,
  onCancel,
}: DeleteConfirmProps) {
  const execute = useToastAsync();
  const [excluindo, setExcluindo] = useState(false);

  const handleExcluir = async () => {
    setExcluindo(true);
    await execute({
      action: () => deleteCategoria(categoria._id, token),
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
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Excluir Categoria
      </h2>
      <p className="text-sm text-gray-700">
        Excluir a categoria{" "}
        <span className="font-semibold">&quot;{categoria.nome}&quot;</span>?
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Esta ação não pode ser desfeita.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button typeStyle="refused" size="small" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          typeStyle="primary"
          size="small"
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
