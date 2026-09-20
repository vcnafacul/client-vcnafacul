import {
  DashTable,
  dashV2,
  StatusBadge,
  type DashColumn,
} from "@/components/dashV2";
import ModalTemplate from "@/components/templates/modalTemplate";
import type {
  DetalheDoEstudante as Detalhe,
  RespostaDoEstudante,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { buscarDetalheDoEstudante } from "@/services/relatorioSimulado/buscarDetalheDoEstudante";
import { useCallback, useEffect, useState } from "react";
import { rotuloDoResultado } from "./rotuloDoResultado";

const VAZIO = "—";

export const TEXTO_PROCESSANDO =
  "A leitura deste cartão ainda está processando. Volte em alguns minutos.";
export const TEXTO_FALHA_SEM_DESCRICAO = "A leitura deste cartão falhou.";
export const TEXTO_SEM_RESPOSTAS = "Nenhuma resposta neste cartão";

const colunas: DashColumn<RespostaDoEstudante>[] = [
  {
    id: "numero",
    header: "Questão",
    width: "6rem",
    primary: true,
    // Questão sem número já vem no fim, ordenada pelo ms.
    cell: (r) => r.numero ?? VAZIO,
  },
  {
    id: "marcada",
    header: "Marcou",
    width: "6rem",
    align: "center",
    /**
     * ⚠️ Ausência vira `—`, e o rótulo do resultado ao lado diz "Sem leitura".
     * Nenhuma letra é inventada aqui: a chave não existe no documento.
     */
    cell: (r) => r.alternativaEstudante ?? VAZIO,
  },
  {
    id: "correta",
    header: "Correta",
    width: "6rem",
    align: "center",
    cell: (r) => r.alternativaCorreta ?? VAZIO,
  },
  {
    id: "resultado",
    header: "Resultado",
    width: "9rem",
    cell: (r) => {
      const { texto, tone } = rotuloDoResultado(r.resultado);
      return <StatusBadge tone={tone} label={texto} />;
    },
  },
];

/**
 * O vazio desta tabela.
 *
 * ⚠️ **Não é o `DashTableVazio`**: ele traz "tente limpar os filtros", e não há
 * filtro nenhum dentro deste modal. Mesma decisão do `VazioDeEstudantes` na
 * tela e do `VazioDeQuestoes` na aba.
 */
function VazioDeRespostas() {
  return (
    <div
      data-testid="respostas-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_SEM_RESPOSTAS}
      </p>
    </div>
  );
}

export interface EstudanteDoDetalhe {
  usuario: string;
  nome: string;
  matricula: string;
}

/**
 * O que UM estudante marcou num simulado, questão a questão.
 *
 * ⚠️ **Quem classifica acerto/erro/sem leitura é o ms**, não esta tela. A regra
 * de "sem leitura" é a AUSÊNCIA da chave `alternativaEstudante` — sutil, medida
 * em BSON real. Duas implementações dela divergiriam, e o número que o
 * professor usa para decidir o que revisar em aula sairia errado de um dos
 * lados.
 */
export function DetalheDoEstudante({
  token,
  simuladoId,
  estudante,
  isOpen,
  onClose,
}: {
  token: string;
  simuladoId: string;
  estudante: EstudanteDoDetalhe;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("loading");

  const carregar = useCallback(() => {
    // ⚠️ Só com o modal aberto. Ele é renderizado pela tela do relatório junto
    // da linha; buscar sempre seria uma chamada por linha da tabela.
    if (!isOpen) return;
    setEstado("loading");
    buscarDetalheDoEstudante(token, simuladoId, estudante.usuario)
      .then((d) => {
        setDetalhe(d);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  }, [isOpen, token, simuladoId, estudante.usuario]);

  useEffect(carregar, [carregar]);

  const processando =
    detalhe?.status === "awaiting_omr" ||
    detalhe?.status === "pending" ||
    detalhe?.status === "processing";

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={onClose}
      className="w-full max-w-3xl rounded-lg bg-white p-4 shadow-xl"
    >
      <div className="flex flex-col gap-4">
        <header>
          <h2 className={cn("text-lg font-semibold", dashV2.text.primary)}>
            {estudante.nome}
          </h2>
          <p className={cn("text-xs", dashV2.text.muted)}>
            {estudante.matricula}
          </p>
        </header>

        {estado === "error" && (
          <div className="flex flex-col items-start gap-2">
            <p className={cn("text-sm", dashV2.text.secondary)}>
              Erro ao carregar o detalhe.
            </p>
            <button
              type="button"
              onClick={carregar}
              className={cn(
                "rounded-sm text-sm font-medium underline-offset-2 hover:underline",
                dashV2.text.primary,
                dashV2.focus,
              )}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/*
          ⚠️ Cartão falho mostra o MOTIVO, não uma tabela vazia. É a única
          informação acionável da tela neste caso — diz o que fazer com a folha.
        */}
        {estado === "idle" && detalhe?.status === "failed" && (
          <p className={cn("text-sm", dashV2.text.secondary)}>
            {detalhe.falha?.descricao ?? TEXTO_FALHA_SEM_DESCRICAO}
          </p>
        )}

        {estado === "idle" && processando && (
          <p className={cn("text-sm", dashV2.text.secondary)}>
            {TEXTO_PROCESSANDO}
          </p>
        )}

        {estado !== "error" && !processando && detalhe?.status !== "failed" && (
          /*
            ⚠️ Sem `onSortChange`: a ordem é a do ms (por número da questão), e
            deixar reordenar por "resultado" numa prova não acrescenta nada que
            não se veja de relance.
          */
          <DashTable<RespostaDoEstudante>
            rows={detalhe?.respostas ?? []}
            columns={colunas}
            rowKey={(r) => r.questaoId}
            state={estado}
            onRetry={carregar}
            stickyHeader
            emptyState={<VazioDeRespostas />}
          />
        )}
      </div>
    </ModalTemplate>
  );
}

export default DetalheDoEstudante;
