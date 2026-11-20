import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { Pendencia, ROTULO_DA_ABA } from "./pendencias";

/** Lista do que impede salvar o conteúdo, cada item com "Ir" até o campo. */
export function ListaDePendencias({
  pendencias,
  onIrPara,
}: {
  pendencias: Pendencia[];
  onIrPara: (pendencia: Pendencia) => void;
}) {
  return (
    <div className="space-y-1" role="alert">
      <p className="text-sm text-destructive font-medium flex items-center gap-1">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {pendencias.length === 1
          ? "1 problema impede salvar:"
          : `${pendencias.length} problemas impedem salvar:`}
      </p>
      {/* Altura máxima: a faixa fica fixa no topo e não pode cobrir a tela. */}
      <ul className="text-sm text-destructive space-y-1 max-h-32 overflow-y-auto sm:max-h-none">
        {pendencias.map((p) => (
          <li key={p.campo} className="flex flex-wrap items-center gap-x-2">
            {/* A mensagem já diz o campo ("A alternativa A é obrigatória"). */}
            <span>
              {p.mensagem}
              <span className="text-destructive">
                {" "}
                · aba {ROTULO_DA_ABA[p.aba]}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onIrPara(p)}
              className="text-xs font-semibold text-foreground underline underline-offset-2 hover:text-primary"
            >
              Ir até o campo
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Faixa do topo do modal, nas abas que não têm o Salvar do conteúdo: enquanto
 * o enunciado/alternativas estão em edição, mostra o que impede salvar ou, sem
 * problemas, deixa salvar dali mesmo.
 *
 * ⚠️ O botão diz **o que** salva ("enunciado e alternativas"): a aba
 * Classificação tem o Salvar dela, e "Salvar" sozinho ali seria ambíguo.
 */
export function FaixaDoConteudo({
  pendencias,
  onIrPara,
  isDirty,
  isSaving,
  onSave,
}: {
  pendencias: Pendencia[];
  onIrPara: (pendencia: Pendencia) => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  if (!pendencias.length && !isDirty) return null;
  return (
    <div
      className={`rounded-md border p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
        pendencias.length
          ? "border-destructive/30 bg-destructive-muted"
          : "border-warning/30 bg-warning-muted"
      }`}
    >
      <div className="min-w-0 flex-1">
        {pendencias.length ? (
          <ListaDePendencias pendencias={pendencias} onIrPara={onIrPara} />
        ) : (
          <p className="text-sm text-warning font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />O enunciado ou as
            alternativas têm alterações não salvas
          </p>
        )}
      </div>
      <Button
        size="sm"
        className="w-full sm:w-auto shrink-0"
        onClick={onSave}
        disabled={isSaving || !isDirty || pendencias.length > 0}
        title={
          pendencias.length
            ? "Corrija os problemas acima para salvar"
            : undefined
        }
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Salvar enunciado e alternativas
      </Button>
    </div>
  );
}
