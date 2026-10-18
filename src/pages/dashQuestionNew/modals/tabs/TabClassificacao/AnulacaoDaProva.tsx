import { ModalAnularQuestao } from "@/components/molecules/anulacao/ModalAnularQuestao";
import { TITULO_EDITAR } from "@/components/molecules/anulacao/textos";
import { Button } from "@/components/ui/button";
import { AnulacaoInput, AnulacaoNaProva } from "@/dtos/question/anulacao";
import { anularQuestao, desanularQuestao, ErroDaAnulacao } from "@/services/anulacao/anularQuestao";
import { useState } from "react";
import { toast } from "react-toastify";

export const TEXTO_PROVA_APLICADA =
  "Esta prova já tem resultados. A anulação em prova aplicada chega com o recálculo do relatório.";

/**
 * As ações da anulação na prova em foco (tickets/042, cards 07 e 21): Anular
 * nesta prova, ou Editar justificativa + Desanular. Só para quem pode anular
 * naquela prova; o estado (motivo, justificativa) aparece no `AnuladaEm`.
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

  // tickets/042, card 21: só as ações, na linha do título "Prova". O estado
  // (motivo, justificativa) mora no aviso do topo — `AnuladaEm`.
  if (!podeAnular) return null;

  const pequeno = "h-6 px-2 text-xs";
  return (
    <div data-testid="anulacao-da-prova" className="flex flex-wrap justify-end gap-1">
      {anulacao ? (
        <>
          <Button size="sm" variant="outline" className={pequeno} disabled={ocupado} onClick={() => setAberto(true)}>
            Editar justificativa
          </Button>
          <Button size="sm" variant="outline" className={pequeno} disabled={ocupado} onClick={desanular}>
            Desanular
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className={`${pequeno} text-rose-700 border-rose-300 hover:bg-rose-50 hover:text-rose-800`}
          disabled={ocupado}
          onClick={() => setAberto(true)}
        >
          Anular nesta prova
        </Button>
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
