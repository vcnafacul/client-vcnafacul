import DocxPreview from "@/components/atoms/docxPreview";
import { YoutubePlayer } from "@/components/atoms/youtubePlayer";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AdjustmentProposalDto,
  ProposalStatus,
} from "@/dtos/content/adjustmentProposalDto";
import { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { ContentFileHistoryDto } from "@/dtos/content/contentFileHistoryDto";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import {
  getProposals,
  reviewProposal,
} from "@/services/content/adjustmentProposal";
import { getFileHistory } from "@/services/content/fileHistory";
import { getFile } from "@/services/content/getFile";
import { resetDemand } from "@/services/content/resetDemand";
import { updateStatus } from "@/services/content/updateStatus";
import { useAuthStore } from "@/store/auth";
import { useCallback, useEffect, useState } from "react";
import AdjustmentProposalModal from "../AdjustmentProposalModal";
import { AbaConteudo } from "./AbaConteudo";
import { AbaPropostas } from "./AbaPropostas";
import { Cabecalho } from "./Cabecalho";

interface DemandaModalProps {
  demand: ContentDtoInput;
  updateStatusDemand: (id: string) => void;
  isOpen: boolean;
  handleClose: () => void;
}

type Material = { _id: string; tipo?: string; videoId?: string };

/**
 * O modal da demanda para quem valida (tickets/050): cabeçalho com quem fez
 * o quê, abas Conteúdo e Propostas (Histórico entra no 050/04), ações no
 * rodapé. Substitui o `ValidatedDemand`.
 */
export default function DemandaModal({
  demand,
  updateStatusDemand,
  isOpen,
  handleClose,
}: DemandaModalProps) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();
  const [proposals, setProposals] = useState<AdjustmentProposalDto[]>([]);
  const [fileHistory, setFileHistory] = useState<ContentFileHistoryDto[]>([]);
  const [previewBuffer, setPreviewBuffer] = useState<ArrayBuffer>();
  const [videoPreviewId, setVideoPreviewId] = useState<string | null>(null);

  const modals = useModals([
    "docxPreview",
    "adjustmentProposal",
    "proposalPreview",
  ]);
  const {
    data: { token, permissao },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const demandId = demand.id ?? (demand as { _id?: string })._id ?? "";
  const fileId =
    demand.file?.id ?? (demand.file as { _id?: string } | undefined)?._id;
  const temMaterial = !!fileId;
  // O tipo do conteúdo é o do vigente (tickets/049): vídeo não tem arquivo.
  const ehVideo = demand.file?.tipo === "video";

  const canReview: boolean =
    permissao[Roles.validarDemanda] &&
    demand.status !== StatusContent.Pending_Upload;
  const canUpload: boolean =
    permissao[Roles.uploadDemanda] &&
    demand.status !== StatusContent.Pending_Upload;

  const loadProposalsAndHistory = useCallback(async () => {
    try {
      const [p, h] = await Promise.all([
        getProposals(demandId, token),
        getFileHistory(demandId, token),
      ]);
      setProposals(p);
      setFileHistory(h);
    } catch {
      // silent
    }
  }, [demandId, token]);

  useEffect(() => {
    const fetchFile = async () => {
      if (fileId && !ehVideo) {
        await executeAsync({
          action: () => getFile(fileId, token),
          loadingMessage: "Carregando documento ...",
          successMessage: "Documento carregado com sucesso",
          errorMessage: (error: Error) => error.message,
          onSuccess: (b: Blob) => {
            setBlob(b);
            b.arrayBuffer().then(setArrayBuffer);
          },
        });
      }
    };
    fetchFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demand.file, fileId, ehVideo, token]);

  useEffect(() => {
    if (isOpen && demandId) loadProposalsAndHistory();
  }, [isOpen, demandId, loadProposalsAndHistory]);

  const handleDownload = () => {
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = demand.file?.originalName || "arquivo.docx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  /*
    Rejeitar, resetar e revisar proposta mudam a demanda de vez (aprovar a
    proposta troca o arquivo): confirmam antes. Rejeitar ainda pede o motivo —
    a api recusa sem ele, e é o que quem enviou lê para saber o que corrigir.
  */
  const [confirmacao, setConfirmacao] = useState<{
    titulo: string;
    texto: string;
    pedeMotivo?: boolean;
    acao: (motivo?: string) => void;
  } | null>(null);
  const [motivo, setMotivo] = useState("");
  const motivoFalta = !!confirmacao?.pedeMotivo && motivo.trim() === "";

  const handleUpdateStatus = async (
    status: StatusEnum | StatusContent,
    reason?: string,
  ) => {
    await executeAsync({
      action: () => updateStatus(demandId, status, token, reason),
      loadingMessage: "Atualizando status...",
      successMessage: "Status atualizado com sucesso",
      errorMessage: (error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demandId);
        handleClose();
      },
    });
  };

  const handleReset = async () => {
    await executeAsync({
      action: () => resetDemand(demandId, token),
      loadingMessage: "Resetando demanda...",
      successMessage: "Demanda resetada",
      errorMessage: (error) => error.message,
      onSuccess: () => {
        updateStatusDemand(demandId);
        handleClose();
      },
    });
  };

  const handleReviewProposal = async (
    proposalId: string,
    status: ProposalStatus,
  ) => {
    await executeAsync({
      action: () => reviewProposal(proposalId, status, token),
      loadingMessage:
        status === ProposalStatus.Approved ? "Aprovando..." : "Rejeitando...",
      successMessage:
        status === ProposalStatus.Approved
          ? "Proposta aprovada com sucesso"
          : "Proposta rejeitada",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        loadProposalsAndHistory();
        if (status === ProposalStatus.Approved) updateStatusDemand(demandId);
      },
    });
  };

  /** Player para vídeo; docx baixado e renderizado para documento. */
  const visualizarMaterial = async (file: Material) => {
    if (file.tipo === "video") {
      setVideoPreviewId(file.videoId ?? null);
      return;
    }
    await executeAsync({
      action: () => getFile(file._id, token),
      loadingMessage: "Carregando documento...",
      successMessage: "Documento carregado",
      errorMessage: (error: Error) => error.message,
      onSuccess: (b: Blob) => {
        b.arrayBuffer().then((buf) => {
          setPreviewBuffer(buf);
          modals.proposalPreview.open();
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-5xl p-0 max-h-[90dvh] flex flex-col gap-0">
        <DialogTitle className="sr-only">{demand.title}</DialogTitle>

        <div className="p-4 sm:p-6 pb-3 sm:pb-3 shrink-0">
          <Cabecalho demand={demand} />
        </div>

        {/* Só o meio rola: cabeçalho e ações ficam sempre à vista. */}
        <Tabs defaultValue="conteudo" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="mx-4 sm:mx-6 shrink-0 justify-start">
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="propostas">
              Propostas{proposals.length ? ` (${proposals.length})` : ""}
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
            <TabsContent value="conteudo" className="mt-0">
              <AbaConteudo
                demand={demand}
                temMaterial={temMaterial}
                ehVideo={ehVideo}
                canUpload={canUpload}
                onDownload={handleDownload}
                onVisualizar={() => modals.docxPreview.open()}
                onProporAjuste={() => modals.adjustmentProposal.open()}
              />
            </TabsContent>
            <TabsContent value="propostas" className="mt-0">
              <AbaPropostas
                proposals={proposals}
                fileHistory={fileHistory}
                podeRevisar={!!permissao[Roles.validarDemanda]}
                onVisualizar={visualizarMaterial}
                onAprovar={(proposal) =>
                  setConfirmacao({
                    titulo: "Aprovar esta proposta?",
                    texto:
                      "O material da demanda será trocado pelo da proposta.",
                    acao: () =>
                      handleReviewProposal(
                        proposal._id,
                        ProposalStatus.Approved,
                      ),
                  })
                }
                onRecusar={(proposal) =>
                  setConfirmacao({
                    titulo: "Rejeitar esta proposta?",
                    texto: "O material atual da demanda continua.",
                    acao: () =>
                      handleReviewProposal(
                        proposal._id,
                        ProposalStatus.Rejected,
                      ),
                  })
                }
              />
            </TabsContent>
          </div>
        </Tabs>

        <footer className="shrink-0 border-t px-4 sm:px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="default"
            className="bg-green2 hover:bg-green2/80"
            onClick={() => handleUpdateStatus(StatusEnum.Approved)}
            disabled={!canReview || demand.status === StatusEnum.Approved}
          >
            Aprovar
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              setConfirmacao({
                titulo: "Rejeitar esta demanda?",
                // ⚠️ Ela NÃO volta para a fila de envio: fica rejeitada, com o
                // motivo visível para quem enviou. Devolver à fila é o Resetar.
                texto:
                  "A demanda fica como rejeitada, com o motivo abaixo visível para quem enviou. Para devolvê-la à fila de envio, use Resetar.",
                pedeMotivo: true,
                acao: (m) => handleUpdateStatus(StatusEnum.Rejected, m),
              })
            }
            disabled={!canReview || demand.status === StatusEnum.Rejected}
          >
            Rejeitar
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setConfirmacao({
                titulo: "Resetar esta demanda?",
                texto:
                  "O arquivo atual sai da demanda (fica no histórico) e ela volta a aguardar envio.",
                acao: handleReset,
              })
            }
            disabled={!canReview}
          >
            Resetar
          </Button>
        </footer>
      </DialogContent>

      <Dialog
        open={modals.docxPreview.isOpen}
        onOpenChange={modals.docxPreview.close}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-6xl max-h-[90dvh] overflow-y-auto p-3 sm:p-6">
          <DialogTitle className="sr-only">
            Pré-visualização do documento
          </DialogTitle>
          {arrayBuffer && <DocxPreview arrayBuffer={arrayBuffer} />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={modals.proposalPreview.isOpen}
        onOpenChange={modals.proposalPreview.close}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-6xl max-h-[90dvh] overflow-y-auto p-3 sm:p-6">
          <DialogTitle className="sr-only">
            Pré-visualização da versão
          </DialogTitle>
          {previewBuffer && <DocxPreview arrayBuffer={previewBuffer} />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!videoPreviewId}
        onOpenChange={() => setVideoPreviewId(null)}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-4xl p-3 sm:p-6">
          <DialogTitle className="sr-only">
            Pré-visualização do vídeo
          </DialogTitle>
          {videoPreviewId && <YoutubePlayer videoId={videoPreviewId} />}
        </DialogContent>
      </Dialog>

      <AdjustmentProposalModal
        contentId={demandId}
        isOpen={modals.adjustmentProposal.isOpen}
        handleClose={() => modals.adjustmentProposal.close()}
        onSuccess={loadProposalsAndHistory}
      />

      <ModalConfirmCancel
        isOpen={!!confirmacao}
        handleClose={() => {
          setConfirmacao(null);
          setMotivo("");
        }}
        confirmDisabled={motivoFalta}
        handleConfirm={() => {
          if (motivoFalta) return;
          const acao = confirmacao?.acao;
          const motivoEnviado = motivo.trim();
          setConfirmacao(null);
          setMotivo("");
          acao?.(motivoEnviado || undefined);
        }}
        text={confirmacao?.titulo}
      >
        <p className="text-sm text-muted-foreground">{confirmacao?.texto}</p>
        {confirmacao?.pedeMotivo && (
          <Textarea
            aria-label="Motivo da rejeição"
            placeholder="O que precisa ser corrigido?"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={1000}
            className="resize-none h-28"
            autoFocus
          />
        )}
      </ModalConfirmCancel>
    </Dialog>
  );
}
