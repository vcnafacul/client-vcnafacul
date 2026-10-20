/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import DocxPreview from "@/components/atoms/docxPreview";
import { YoutubePlayer } from "@/components/atoms/youtubePlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import {
  AdjustmentProposalDto,
  ProposalStatus,
} from "@/dtos/content/adjustmentProposalDto";
import { ContentFileHistoryDto } from "@/dtos/content/contentFileHistoryDto";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getFile } from "@/services/content/getFile";
import { resetDemand } from "@/services/content/resetDemand";
import { updateStatus } from "@/services/content/updateStatus";
import {
  getProposals,
  reviewProposal,
} from "@/services/content/adjustmentProposal";
import { getFileHistory } from "@/services/content/fileHistory";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/utils/date";
import { useCallback, useEffect, useState } from "react";
import AdjustmentProposalModal from "./AdjustmentProposalModal";

interface ValidatedDemandProps {
  demand: ContentDtoInput;
  updateStatusDemand: (id: string) => void;
  isOpen: boolean;
  handleClose: () => void;
}

const statusLabel: Record<ProposalStatus, string> = {
  [ProposalStatus.Pending]: "Pendente",
  [ProposalStatus.Approved]: "Aprovada",
  [ProposalStatus.Rejected]: "Rejeitada",
};

const statusColor: Record<ProposalStatus, string> = {
  [ProposalStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [ProposalStatus.Approved]: "bg-green-100 text-green-800",
  [ProposalStatus.Rejected]: "bg-red-100 text-red-800",
};

export default function ValidatedDemand({
  demand,
  updateStatusDemand,
  isOpen,
  handleClose,
}: ValidatedDemandProps) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();
  const [proposals, setProposals] = useState<AdjustmentProposalDto[]>([]);
  const [fileHistory, setFileHistory] = useState<ContentFileHistoryDto[]>([]);
  const [proposalPreviewBuffer, setProposalPreviewBuffer] =
    useState<ArrayBuffer>();

  const modals = useModals([
    "docxPreview",
    "adjustmentProposal",
    "proposalPreview",
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const demandId = demand.id ?? (demand as any)._id;
  const fileId = demand.file?.id ?? (demand.file as any)?._id;
  // O tipo do conteúdo é o do vigente (tickets/049): vídeo não tem arquivo.
  const ehVideo = demand.file?.tipo === "video";
  const [videoPreviewId, setVideoPreviewId] = useState<string | null>(null);

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
          onSuccess: (blob: Blob) => {
            setBlob(blob);
            blob.arrayBuffer().then(setArrayBuffer);
          },
        });
      }
    };

    fetchFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demand.file, fileId, ehVideo, token]);

  useEffect(() => {
    if (isOpen && demandId) {
      loadProposalsAndHistory();
    }
  }, [isOpen, demandId, loadProposalsAndHistory]);

  const handleDownload = async () => {
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = demand.file?.originalName || "arquivo.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
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
        if (status === ProposalStatus.Approved) {
          updateStatusDemand(demandId);
        }
      },
    });
  };

  const handlePreviewProposalFile = async (fileContentId: string) => {
    await executeAsync({
      action: () => getFile(fileContentId, token),
      loadingMessage: "Carregando documento da proposta...",
      successMessage: "Documento carregado",
      errorMessage: (error: Error) => error.message,
      onSuccess: (blob: Blob) => {
        blob.arrayBuffer().then((buf) => {
          setProposalPreviewBuffer(buf);
          modals.proposalPreview.open();
        });
      },
    });
  };

  const handlePreviewHistoryFile = async (fileContentId: string) => {
    await executeAsync({
      action: () => getFile(fileContentId, token),
      loadingMessage: "Carregando documento...",
      successMessage: "Documento carregado",
      errorMessage: (error: Error) => error.message,
      onSuccess: (blob: Blob) => {
        blob.arrayBuffer().then((buf) => {
          setProposalPreviewBuffer(buf);
          modals.proposalPreview.open();
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-5xl p-3 sm:p-6 max-h-[90dvh] overflow-y-auto">
        <DialogTitle className="sr-only">{demand.title}</DialogTitle>
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-marine flex flex-wrap items-center gap-2">
              {demand.title}
              {fileId && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {ehVideo ? "Vídeo" : "Documento"}
                </span>
              )}
            </CardTitle>
            {/*
              Quem abriu a demanda, quem enviou o arquivo vigente e quem fez a
              última edição são três pessoas diferentes — a tela mostra as três
              (api 048/06). Sem nome resolvido, o id ainda identifica.
            */}
            <p className="text-xs text-muted-foreground">
              {demand.userId && (
                <span>
                  Criado por {demand.createdByName || demand.userId}
                  {demand.createdAt &&
                    ` em ${formatDate(String(demand.createdAt))}`}
                </span>
              )}
              {fileId && (
                <span>
                  {demand.userId && " · "}
                  Enviado por{" "}
                  {demand.uploadedByName || demand.file?.uploadedBy || "—"}
                </span>
              )}
              {demand.lastEditedBy && (
                <span>
                  {(demand.userId || fileId) && " · "}
                  Última edição por{" "}
                  {demand.lastEditedByName || demand.lastEditedBy}
                  {demand.lastEditedAt &&
                    ` em ${formatDate(demand.lastEditedAt)}`}
                </span>
              )}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-black text-marine">Frente:</p>
                <p>{demand.subject.frente.nome}</p>
              </div>
              <div>
                <p className="text-sm font-black text-marine">Tema:</p>
                <p>{demand.subject.name}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{demand.description}</p>
            </div>

            {demand.status === StatusEnum.Rejected &&
              demand.rejectionReason && (
                <div
                  role="note"
                  className="rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <p className="text-sm font-black text-red-800">
                    Motivo da rejeição:
                  </p>
                  <p className="text-sm text-red-900 whitespace-pre-wrap break-words">
                    {demand.rejectionReason}
                  </p>
                </div>
              )}

            {fileId && ehVideo && demand.file?.videoId && (
              <YoutubePlayer
                videoId={demand.file.videoId}
                title={demand.title}
              />
            )}

            {fileId && (
              <div className="flex flex-wrap gap-2 mt-4">
                {!ehVideo && (
                  <>
                    <Button variant="outline" onClick={handleDownload}>
                      Download
                    </Button>
                    <Button
                      className="bg-marine hover:bg-marine/80"
                      onClick={() => modals.docxPreview.open()}
                    >
                      Visualizar
                    </Button>
                  </>
                )}
                {canUpload && (
                  <Button
                    variant="outline"
                    onClick={() => modals.adjustmentProposal.open()}
                  >
                    Propor Ajuste
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
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
                    acao: (motivo) =>
                      handleUpdateStatus(StatusEnum.Rejected, motivo),
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
            </div>

            {/* Propostas de Ajuste */}
            {proposals.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-marine mb-3">
                  Propostas de Ajuste
                </h3>
                <div className="space-y-3">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal._id}
                      className="border rounded-lg p-3 flex flex-col gap-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            Autor: {proposal.authorName || proposal.author}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusColor[proposal.status]}`}
                          >
                            {statusLabel[proposal.status]}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(proposal.createdAt)}
                        </span>
                      </div>
                      {proposal.comment && (
                        <p className="text-sm text-muted-foreground">
                          {proposal.comment}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground self-center">
                          {proposal.file?.tipo === "video"
                            ? "▶ Vídeo"
                            : proposal.file?.originalName || "Arquivo"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            proposal.file?.tipo === "video"
                              ? setVideoPreviewId(proposal.file.videoId ?? null)
                              : handlePreviewProposalFile(proposal.file._id)
                          }
                        >
                          Visualizar
                        </Button>
                        {proposal.status === ProposalStatus.Pending &&
                          permissao[Roles.validarDemanda] && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green2 hover:bg-green2/80"
                                onClick={() =>
                                  setConfirmacao({
                                    titulo: "Aprovar esta proposta?",
                                    texto:
                                      "O arquivo da demanda será trocado pelo da proposta.",
                                    acao: () =>
                                      handleReviewProposal(
                                        proposal._id,
                                        ProposalStatus.Approved,
                                      ),
                                  })
                                }
                              >
                                Aprovar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setConfirmacao({
                                    titulo: "Rejeitar esta proposta?",
                                    texto:
                                      "O arquivo atual da demanda continua.",
                                    acao: () =>
                                      handleReviewProposal(
                                        proposal._id,
                                        ProposalStatus.Rejected,
                                      ),
                                  })
                                }
                              >
                                Rejeitar
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historico de Arquivos */}
            {fileHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-marine mb-3">
                  Histórico de Arquivos
                </h3>
                <div className="space-y-2">
                  {fileHistory.map((entry) => (
                    <div
                      key={entry._id}
                      className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium break-all">
                          {entry.file?.tipo === "video"
                            ? "▶ Vídeo"
                            : entry.file?.originalName || "Arquivo"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Por: {entry.uploadedByName || entry.uploadedBy} |{" "}
                          {entry.source === "initial_upload"
                            ? "Upload inicial"
                            : "Proposta aprovada"}{" "}
                          | {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          entry.file?.tipo === "video"
                            ? setVideoPreviewId(entry.file.videoId ?? null)
                            : handlePreviewHistoryFile(entry.file._id)
                        }
                      >
                        Visualizar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      {/* Docx Preview Modal */}
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

      {/* Proposal Preview Modal */}
      <Dialog
        open={modals.proposalPreview.isOpen}
        onOpenChange={modals.proposalPreview.close}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-6xl max-h-[90dvh] overflow-y-auto p-3 sm:p-6">
          <DialogTitle className="sr-only">
            Pré-visualização da proposta
          </DialogTitle>
          {proposalPreviewBuffer && (
            <DocxPreview arrayBuffer={proposalPreviewBuffer} />
          )}
        </DialogContent>
      </Dialog>

      {/* Player de uma proposta ou versão do histórico em vídeo */}
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

      {/* Adjustment Proposal Modal */}
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
