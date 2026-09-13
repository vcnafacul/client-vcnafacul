import { useState } from "react";
import Button from "../../../../components/molecules/button";
import { useToastAsync } from "../../../../hooks/useToastAsync";
import { descartarRascunho } from "../../../../services/caderno/template/descartarRascunho";

interface ConfirmarDescarteProps {
  token: string;
  versaoNoAr: number | null;
  onDescartado: () => void;
  onCancel: () => void;
}

function ConfirmarDescarte({
  token,
  versaoNoAr,
  onDescartado,
  onCancel,
}: ConfirmarDescarteProps) {
  const execute = useToastAsync();
  const [descartando, setDescartando] = useState(false);

  const handleDescartar = async () => {
    setDescartando(true);
    await execute({
      action: () => descartarRascunho(token),
      loadingMessage: "Descartando...",
      successMessage: "Rascunho descartado",
      errorMessage: (err: Error) => err.message,
      onSuccess: () => onDescartado(),
      onError: () => onCancel(),
      onFinally: () => setDescartando(false),
    });
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Descartar rascunho
      </h2>
      <p className="text-sm text-gray-700">
        O zip enviado se perde e não dá para trazer de volta — só subindo o
        projeto do Overleaf outra vez.
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {versaoNoAr === null
          ? "A versão publicada não muda: continua não havendo nenhuma."
          : `A versão publicada não muda: as provas seguem saindo com a v${versaoNoAr}.`}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button typeStyle="refused" size="small" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          typeStyle="primary"
          size="small"
          disabled={descartando}
          onClick={handleDescartar}
        >
          Descartar
        </Button>
      </div>
    </div>
  );
}

export default ConfirmarDescarte;
