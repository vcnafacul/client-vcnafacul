import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMissingNumber } from "@/services/prova/getMissingNumber";
import { useAuthStore } from "@/store/auth";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProvaOption } from "./types";

interface ModalAddQuestionToProvaProps {
  provas: ProvaOption[];
  provaIdsJaVinculadas: string[];
  onConfirm: (provaId: string, numero: number) => Promise<void>;
  onClose: () => void;
}

export function ModalAddQuestionToProva({
  provas,
  provaIdsJaVinculadas,
  onConfirm,
  onClose,
}: ModalAddQuestionToProvaProps) {
  const {
    data: { token },
  } = useAuthStore();

  const [busca, setBusca] = useState("");
  const [provaId, setProvaId] = useState<string | null>(null);
  const [numero, setNumero] = useState<number | null>(null);
  const [numeros, setNumeros] = useState<number[]>([]);
  const [loadingNumeros, setLoadingNumeros] = useState(false);
  const [saving, setSaving] = useState(false);

  const provasDisponiveis = useMemo(
    () =>
      provas
        .filter((p) => !provaIdsJaVinculadas.includes(p._id))
        .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [provas, provaIdsJaVinculadas, busca]
  );

  useEffect(() => {
    setNumero(null);
    if (!provaId) {
      setNumeros([]);
      return;
    }
    setLoadingNumeros(true);
    getMissingNumber(provaId, token)
      .then((ns) => setNumeros([...ns].sort((a, b) => a - b)))
      .catch(() => setNumeros([]))
      .finally(() => setLoadingNumeros(false));
  }, [provaId, token]);

  const handleConfirm = async () => {
    if (!provaId || numero == null) return;
    setSaving(true);
    try {
      await onConfirm(provaId, numero);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-bold">Adicionar em uma prova</h3>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Prova</label>
          <input
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setProvaId(null);
            }}
            placeholder="Buscar prova por nome..."
            className="w-full border rounded-md p-2 text-sm"
          />
          <div className="max-h-40 overflow-y-auto border rounded-md">
            {provasDisponiveis.map((p) => (
              <button
                key={p._id}
                onClick={() => setProvaId(p._id)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  provaId === p._id ? "bg-blue-50 font-medium" : ""
                }`}
              >
                {p.nome}
              </button>
            ))}
            {provasDisponiveis.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">
                Nenhuma prova disponível
              </p>
            )}
          </div>
        </div>

        {provaId && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Número</label>
            {loadingNumeros ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando números...
              </div>
            ) : (
              <Select
                value={numero != null ? String(numero) : undefined}
                onValueChange={(v) => setNumero(parseInt(v, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o número" />
                </SelectTrigger>
                <SelectContent>
                  {numeros.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Questão {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!provaId || numero == null || saving}
            className="bg-primary"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
