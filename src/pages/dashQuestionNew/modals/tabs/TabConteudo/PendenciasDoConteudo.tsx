import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ErrorSummary } from "@/components/ui/error-summary";
import { Spinner } from "@/components/ui/spinner";
import { Save } from "lucide-react";
import { Pendencia, ROTULO_DA_ABA } from "./pendencias";

/**
 * Faixa do `banner` do Dialog (D19/D21), nas abas que não têm o Salvar do conteúdo: enquanto
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
  const salvar = (
    <Button
      size="sm"
      className="w-full sm:w-auto shrink-0"
      onClick={onSave}
      disabled={isSaving || !isDirty || pendencias.length > 0}
      title={
        pendencias.length ? "Corrija os problemas acima para salvar" : undefined
      }
    >
      {isSaving ? (
        <Spinner size="button" decorative className="mr-2" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      Salvar enunciado e alternativas
    </Button>
  );
  if (!pendencias.length) {
    return (
      <Alert
        variant="warning"
        title="O enunciado ou as alternativas têm alterações não salvas"
        action={salvar}
        className="flex-col sm:flex-row sm:items-center"
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <ErrorSummary
        items={pendencias.map((p) => ({
          // A mensagem já diz o campo ("A alternativa A é obrigatória").
          message: p.mensagem,
          where: `· aba ${ROTULO_DA_ABA[p.aba]}`,
          onGoTo: () => onIrPara(p),
        }))}
      />
      <div className="flex sm:justify-end">{salvar}</div>
    </div>
  );
}
