/* eslint-disable @typescript-eslint/no-explicit-any */
import DocxPreview from "@/components/atoms/docxPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      if (fileId) {
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
  }, [demand.file, fileId, token]);

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

  const handleUpdateStatus = async (status: StatusEnum | StatusContent) => {
    await executeAsync({
      action: () => updateStatus(demandId, status, token),
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
    status: ProposalStatus
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
      <DialogContent className="max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{demand.title}</DialogTitle>
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-marine">
              {demand.title}
            </CardTitle>
            {demand.lastEditedBy && (
              <p className="text-xs text-muted-foreground">
                Ultima edicao por:{" "}
                {demand.lastEditedByName || demand.lastEditedBy}
                {demand.lastEditedAt &&
                  ` em ${formatDate(demand.lastEditedAt)}`}
              </p>
            )}
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

            {fileId && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleDownload}>
                  Download
                </Button>
                <Button
                  className="bg-marine hover:bg-marine/80"
                  onClick={() => modals.docxPreview.open()}
                >
                  Visualizar
                </Button>
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
                onClick={() => handleUpdateStatus(StatusEnum.Rejected)}
                disabled={!canReview || demand.status === StatusEnum.Rejected}
              >
                Rejeitar
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Autor:{" "}
                            {proposal.authorName || proposal.author}
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePreviewProposalFile(proposal.file._id)
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
                                  handleReviewProposal(
                                    proposal._id,
                                    ProposalStatus.Approved
                                  )
                                }
                              >
                                Aprovar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleReviewProposal(
                                    proposal._id,
                                    ProposalStatus.Rejected
                                  )
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
                  Historico de Arquivos
                </h3>
                <div className="space-y-2">
                  {fileHistory.map((entry) => (
                    <div
                      key={entry._id}
                      className="border rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {entry.file?.originalName || "Arquivo"}
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
                          handlePreviewHistoryFile(entry.file._id)
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
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto p-6">
          <DialogTitle className="sr-only">
            Pre-visualizacao do documento
          </DialogTitle>
          {arrayBuffer && (
            <ScrollArea className="h-[70vh]">
              <DocxPreview arrayBuffer={arrayBuffer} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Proposal Preview Modal */}
      <Dialog
        open={modals.proposalPreview.isOpen}
        onOpenChange={modals.proposalPreview.close}
      >
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto p-6">
          <DialogTitle className="sr-only">
            Pre-visualizacao da proposta
          </DialogTitle>
          {proposalPreviewBuffer && (
            <ScrollArea className="h-[70vh]">
              <DocxPreview arrayBuffer={proposalPreviewBuffer} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Adjustment Proposal Modal */}
      <AdjustmentProposalModal
        contentId={demandId}
        isOpen={modals.adjustmentProposal.isOpen}
        handleClose={() => modals.adjustmentProposal.close()}
        onSuccess={loadProposalsAndHistory}
      />
    </Dialog>
  );
}
