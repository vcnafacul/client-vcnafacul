import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { getMissingNumber } from "@/services/prova/getMissingNumber";
import { useAuthStore } from "@/store/auth";
import { useEffect, useMemo, useState } from "react";
import { ProvaOption } from "./types";
import { mantemArea } from "../areasPermitidas";

interface ModalAddQuestionToProvaProps {
  provas: ProvaOption[];
  provaIdsJaVinculadas: string[];
  /** A área da questão — para marcar as provas ENEM que não a aceitam. */
  enemArea?: string;
  onConfirm: (provaId: string, numero: number) => Promise<void>;
  onClose: () => void;
}

export function ModalAddQuestionToProva({
  provas,
  provaIdsJaVinculadas,
  enemArea,
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
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent
        size="md"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Adicionar em uma prova</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="busca-prova"
            className="text-body font-semibold text-muted-foreground"
          >
            Prova
          </label>
          <input
            id="busca-prova"
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setProvaId(null);
            }}
            placeholder="Buscar prova por nome..."
            className="w-full border rounded-md p-2 text-body"
          />
          <div className="max-h-40 overflow-y-auto border rounded-md">
            {provasDisponiveis.map((p) => {
              /*
                ⚠️ **Conveniência, não garantia** (card 02 de
                `area-enem-da-questao`): a prova ENEM que não aceita a área da
                questão aparece desabilitada, com o motivo. Quem garante é o
                servidor (card 01), que recusa com a mensagem.
              */
              const recusa = !mantemArea(enemArea, [p]);
              return (
                <button
                  key={p._id}
                  data-prova={p._id}
                  disabled={recusa}
                  title={
                    recusa ? `Esta prova não aceita questão de ${enemArea}` : undefined
                  }
                  onClick={() => setProvaId(p._id)}
                  className={`w-full text-left px-3 py-2 text-body hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent ${
                    provaId === p._id ? "bg-info-muted font-medium" : ""
                  }`}
                >
                  {p.nome}
                  {recusa && (
                    <span className="ml-2 text-caption">— não aceita {enemArea}</span>
                  )}
                </button>
              );
            })}
            {provasDisponiveis.length === 0 && (
              <p className="px-3 py-2 text-body text-muted-foreground">
                Nenhuma prova disponível
              </p>
            )}
          </div>
        </div>

        {provaId && (
          <div className="space-y-2">
            <span
              id="numero-da-questao"
              className="text-body font-semibold text-muted-foreground"
            >
              Número
            </span>
            {loadingNumeros ? (
              <div className="flex items-center gap-2 text-body text-muted-foreground">
                <Spinner size="inline" decorative /> Carregando números...
              </div>
            ) : (
              <Select
                value={numero != null ? String(numero) : undefined}
                onValueChange={(v) => setNumero(parseInt(v, 10))}
              >
                <SelectTrigger aria-labelledby="numero-da-questao">
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!provaId || numero == null || saving}
          >
            {saving ? <Spinner size="button" /> : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
