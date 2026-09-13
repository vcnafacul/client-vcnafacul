import { dashV2 } from "@/components/dashV2";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { SimuladoResumo } from "../../../dtos/prova/prova";
import { baixarCaderno } from "../../../services/caderno/baixarCaderno";
import { baixarCartao } from "../../../services/cartaoResposta/baixarCartao";
import AcaoIcone from "./AcaoIcone";
import EditDisponibilidadeModal from "./editDisponibilidadeModal";
import { proporcaoQuestoes } from "./simuladoStatus";
import SimuladoStatusIcon from "./SimuladoStatusIcon";

interface SimuladosViewProps {
  simulados: SimuladoResumo[] | undefined;
  loading: boolean;
  error: string | null;
  token: string;
  onVoltar: () => void;
  onRetry: () => void;
  onSimuladoUpdated: (updated: SimuladoResumo) => void;
}

const MOTIVO_BLOQUEADO =
  "O simulado precisa estar com todas as questões cadastradas, aprovadas e numeradas";

function QuestoesCell({ simulado }: { simulado: SimuladoResumo }) {
  const { pct, texto, completo } = proporcaoQuestoes(
    simulado.questoes?.length ?? 0,
    simulado.categoria?.quantidadeTotalQuestao,
  );

  return (
    <div className="flex items-center gap-2">
      {pct !== null && (
        // ⚠️ `aria-hidden`: a barra repete o número ao lado. Um leitor de tela
        // anunciando a mesma proporção duas vezes atrapalha mais do que ajuda —
        // mesma decisão do `ProgressoCell` da listagem.
        <div
          aria-hidden="true"
          className={cn(
            "h-1.5 w-14 shrink-0 overflow-hidden rounded-full",
            dashV2.progress.track,
          )}
        >
          <div
            data-testid="barra-questoes"
            style={{ width: `${pct}%` }}
            className={cn(
              "h-full",
              completo ? dashV2.progress.done : dashV2.progress.pending,
            )}
          />
        </div>
      )}
      <span
        className={cn(
          "shrink-0 whitespace-nowrap text-xs tabular-nums",
          dashV2.text.secondary,
        )}
      >
        {texto}
      </span>
    </div>
  );
}

function SimuladosView({
  simulados,
  loading,
  error,
  token,
  onVoltar,
  onRetry,
  onSimuladoUpdated,
}: SimuladosViewProps) {
  const [editing, setEditing] = useState<SimuladoResumo | null>(null);

  // ⚠️ Guarda o `_id` em voo, não um booleano. Um booleano único desabilitaria
  // a tabela INTEIRA, e o coordenador que quer baixar dois simulados
  // esperaria sem motivo.
  const [baixandoCaderno, setBaixandoCaderno] = useState<string | null>(null);

  // Botão de rascunho só existe com a env ligada. Lido uma vez, fora do
  // render: `import.meta.env` é estático no build do Vite.
  const rascunhoHabilitado = import.meta.env.VITE_CADERNO_DRAFT === "true";

  const handleDownloadCaderno = async (
    simulado: SimuladoResumo,
    draft = false,
  ) => {
    // ⚠️ Guarda contra clique repetido. O botão já sinaliza, mas entre o
    // clique e o re-render cabe um segundo clique — e gerar o caderno é
    // lento o bastante para essa janela ser real.
    if (baixandoCaderno) return;
    setBaixandoCaderno(simulado._id);

    const id = toast.loading(
      draft ? "Gerando rascunho..." : "Gerando caderno...",
    );
    try {
      const { blob, avisos } = await baixarCaderno(simulado._id, token, draft);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `caderno_${simulado.nome}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ⚠️ Aviso é `warning`, não `success`. O download funcionou, mas há algo
      // para conferir antes de imprimir — e este toast é o canal que devolve a
      // responsabilidade a quem cadastrou a questão. Um success verde faz a
      // pessoa fechar sem ler.
      toast.update(id, {
        render:
          avisos > 0
            ? `Caderno gerado com ${avisos} ${
                avisos === 1 ? "observação" : "observações"
              } — confira as questões marcadas`
            : "Caderno baixado com sucesso!",
        type: avisos > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: avisos > 0 ? 8000 : 3000,
        closeOnClick: true,
      });
    } catch (erro) {
      // ⚠️ A mensagem do backend, não uma genérica. É o fim da corrente que o
      // card 05 consertou.
      toast.update(id, {
        render:
          erro instanceof Error ? erro.message : "Erro ao baixar o caderno",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    } finally {
      setBaixandoCaderno(null);
    }
  };

  const handleDownloadCartao = async (simulado: SimuladoResumo) => {
    const id = toast.loading("Baixando cartão...");
    try {
      const blob = await baixarCartao(simulado._id, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cartao_${simulado.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.update(id, {
        render: "Cartão baixado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch {
      toast.update(id, {
        render: "Erro ao baixar o cartão",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div>
        <button
          onClick={onVoltar}
          className={cn(
            "mb-4 flex items-center gap-1 rounded-md text-sm hover:underline",
            dashV2.text.secondary,
            dashV2.focus,
          )}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar aos detalhes
        </button>

        <h3 className={cn("mb-4 text-sm font-medium", dashV2.text.primary)}>
          Simulados
        </h3>

        {loading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-10 animate-pulse rounded",
                  dashV2.progress.track,
                )}
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="py-8 text-center">
            <p className="mb-3 text-sm text-red">
              Não foi possível carregar os simulados.
            </p>
            <Button variant="outlined" size="small" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!loading && !error && simulados?.length === 0 && (
          <p className={cn("py-8 text-center text-sm", dashV2.text.muted)}>
            Esta prova ainda não tem simulados cadastrados.
          </p>
        )}

        {!loading && !error && simulados && simulados.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead
              className={cn(
                "text-xs uppercase",
                dashV2.text.muted,
                "bg-backgroundGrey",
              )}
            >
              <tr>
                {/*
                  ⚠️ Cabeçalho da coluna de status em `sr-only`, não vazio. A
                  coluna tem 40px e não cabe rótulo, mas um `<th>` sem texto
                  deixa a tabela sem nome para aquela coluna no leitor de tela.
                */}
                <th scope="col" className="w-10 px-2 py-2">
                  <span className="sr-only">Status</span>
                </th>
                <th scope="col" className="px-3 py-2">
                  Simulado
                </th>
                <th scope="col" className="px-3 py-2">
                  Questões
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightGray">
              {simulados.map((simulado) => (
                <tr key={simulado._id} className={dashV2.row.hover}>
                  <td className="px-2 py-2 align-middle">
                    <SimuladoStatusIcon simulado={simulado} />
                  </td>

                  <td className="px-3 py-2">
                    {/*
                      ⚠️ Categoria como segunda linha, e não coluna própria: o
                      modal tem 672px e as sete colunas de antes só cabiam com
                      rolagem horizontal. Aqui ela fica junto do nome, que é o
                      contexto em que se lê.
                    */}
                    <span
                      className={cn("block font-medium", dashV2.text.primary)}
                    >
                      {simulado.nome}
                    </span>
                    <span className={cn("block text-xs", dashV2.text.muted)}>
                      {simulado.categoria?.nome ?? "Sem categoria"}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <QuestoesCell simulado={simulado} />
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <AcaoIcone
                        icone={ClipboardDocumentCheckIcon}
                        rotulo="Baixar cartão de resposta"
                        onClick={() => handleDownloadCartao(simulado)}
                        desabilitado={simulado.bloqueado}
                        motivoDesabilitado={`Cartão de resposta indisponível. ${MOTIVO_BLOQUEADO}`}
                      />

                      {!simulado.bloqueado && (
                        <AcaoIcone
                          icone={BookOpenIcon}
                          rotulo="Baixar caderno de questões (pacote .zip para abrir no Overleaf)"
                          onClick={() => handleDownloadCaderno(simulado)}
                          carregando={baixandoCaderno === simulado._id}
                        />
                      )}

                      {/*
                        ⚠️ Ícone diferente do caderno pronto, não a mesma folha
                        em outra cor. Nenhum laranja da paleta alcança 3:1 sobre
                        branco (ver `tokens.ts`), então a distinção "rascunho"
                        precisa estar na forma para existir para todo mundo.
                      */}
                      {simulado.bloqueado && rascunhoHabilitado && (
                        <AcaoIcone
                          icone={DocumentTextIcon}
                          rotulo="Baixar rascunho do caderno (sai com marca d'água e a lista de pendências)"
                          onClick={() => handleDownloadCaderno(simulado, true)}
                          carregando={baixandoCaderno === simulado._id}
                        />
                      )}

                      {simulado.bloqueado && !rascunhoHabilitado && (
                        <AcaoIcone
                          icone={BookOpenIcon}
                          rotulo="Baixar caderno de questões"
                          desabilitado
                          motivoDesabilitado={`Caderno indisponível. ${MOTIVO_BLOQUEADO}`}
                        />
                      )}

                      <AcaoIcone
                        icone={CalendarDaysIcon}
                        rotulo="Editar janela de disponibilidade"
                        onClick={() => setEditing(simulado)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {editing && (
          <EditDisponibilidadeModal
            simulado={editing}
            token={token}
            isOpen={!!editing}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              onSimuladoUpdated(updated);
              setEditing(null);
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

export default SimuladosView;
