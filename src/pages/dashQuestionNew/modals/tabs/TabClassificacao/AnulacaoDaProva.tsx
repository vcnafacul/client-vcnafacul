import { ModalAnularQuestao } from "@/components/molecules/anulacao/ModalAnularQuestao";
import { TITULO_EDITAR } from "@/components/molecules/anulacao/textos";
import { Button } from "@/components/ui/button";
import { AnulacaoInput, AnulacaoNaProva, rotuloDoMotivo } from "@/dtos/question/anulacao";
import { anularQuestao, desanularQuestao, ErroDaAnulacao } from "@/services/anulacao/anularQuestao";
import { XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export const TEXTO_PROVA_APLICADA =
  "Esta prova já tem resultados. A anulação em prova aplicada chega com o recálculo do relatório.";

/**
 * O estado da questão NA prova em foco, e as ações (tickets/042, card 07).
 * Aparece para todos; as ações, só para quem pode anular naquela prova.
 */
export function AnulacaoDaProva({
  questaoId,
  provaId,
  provaNome,
  numero,
  anulacao,
  podeAnular,
  token,
  onMudou,
}: {
  questaoId: string;
  provaId: string;
  provaNome: string;
  numero: number | null;
  anulacao?: AnulacaoNaProva;
  podeAnular: boolean;
  token: string;
  onMudou?: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const mensagem = (e: unknown) =>
    e instanceof ErroDaAnulacao && e.code === "PROVA_JA_APLICADA"
      ? TEXTO_PROVA_APLICADA
      : (e as Error).message;

  const confirmar = async (dto: AnulacaoInput) => {
    setOcupado(true);
    setErro(null);
    try {
      await anularQuestao(provaId, questaoId, dto, token);
      toast.success(anulacao ? "Anulação atualizada." : `Questão anulada em ${provaNome}.`);
      setAberto(false);
      onMudou?.();
    } catch (e) {
      setErro(mensagem(e));
    } finally {
      setOcupado(false);
    }
  };

  const desanular = async () => {
    if (!confirm(`Desanular a questão${numero != null ? ` ${numero}` : ""} em "${provaNome}"? Ela volta a contar na nota.`)) return;
    setOcupado(true);
    try {
      await desanularQuestao(provaId, questaoId, token);
      toast.success("Questão desanulada.");
      onMudou?.();
    } catch (e) {
      toast.error(mensagem(e));
    } finally {
      setOcupado(false);
    }
  };

  if (!anulacao && !podeAnular) return null;

  return (
    <div data-testid="anulacao-da-prova" className="flex flex-col gap-2">
      {anulacao ? (
        <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-sm">
          <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold text-rose-800">
              Anulada nesta prova: {rotuloDoMotivo(anulacao.motivo)}
            </p>
            <p className="text-rose-900 break-words">{anulacao.justificativa}</p>
            <p className="text-xs text-rose-700 mt-1">Fora da análise: não conta na nota nem nos relatórios.</p>
          </div>
        </div>
      ) : null}
      {podeAnular && (
        <div className="flex flex-wrap gap-2">
          {anulacao ? (
            <>
              <Button size="sm" variant="outline" disabled={ocupado} onClick={() => setAberto(true)}>
                Editar justificativa
              </Button>
              <Button size="sm" variant="outline" disabled={ocupado} onClick={desanular}>
                Desanular
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-rose-700 border-rose-300 hover:bg-rose-50"
              disabled={ocupado}
              onClick={() => setAberto(true)}
            >
              Anular nesta prova
            </Button>
          )}
        </div>
      )}
      {aberto && (
        <ModalAnularQuestao
          numero={numero}
          provaNome={provaNome}
          inicial={anulacao}
          titulo={anulacao ? TITULO_EDITAR : undefined}
          textoDoBotao={anulacao ? "Salvar" : "Anular"}
          ocupado={ocupado}
          erro={erro}
          onConfirmar={confirmar}
          onCancelar={() => {
            setAberto(false);
            setErro(null);
          }}
        />
      )}
    </div>
  );
}
