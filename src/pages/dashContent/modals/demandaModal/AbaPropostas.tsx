import { Button } from "@/components/ui/button";
import {
  AdjustmentProposalDto,
  ProposalStatus,
} from "@/dtos/content/adjustmentProposalDto";
import { ContentFileHistoryDto } from "@/dtos/content/contentFileHistoryDto";
import { formatDate } from "@/utils/date";
import { rotuloDoMaterial } from "./helpers";

const statusLabel: Record<ProposalStatus, string> = {
  [ProposalStatus.Pending]: "Pendente",
  [ProposalStatus.Approved]: "Aprovada",
  [ProposalStatus.Rejected]: "Recusada",
};

const statusColor: Record<ProposalStatus, string> = {
  [ProposalStatus.Pending]: "bg-amber-100 text-amber-800",
  [ProposalStatus.Approved]: "bg-emerald-100 text-emerald-800",
  [ProposalStatus.Rejected]: "bg-rose-100 text-rose-800",
};

interface Props {
  proposals: AdjustmentProposalDto[];
  /** Até a aba Histórico (050/04), as versões do material ficam aqui. */
  fileHistory: ContentFileHistoryDto[];
  podeRevisar: boolean;
  onVisualizar: (file: {
    _id: string;
    tipo?: string;
    videoId?: string;
  }) => void;
  onAprovar: (proposal: AdjustmentProposalDto) => void;
  onRecusar: (proposal: AdjustmentProposalDto) => void;
}

export function AbaPropostas({
  proposals,
  fileHistory,
  podeRevisar,
  onVisualizar,
  onAprovar,
  onRecusar,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-base font-bold text-marine mb-3">
          Propostas de ajuste
        </h3>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma proposta de ajuste.
          </p>
        ) : (
          <ul className="space-y-3">
            {proposals.map((proposal) => (
              <li
                key={proposal._id}
                className="border rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
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
                {proposal.status !== ProposalStatus.Pending &&
                  proposal.reviewedBy && (
                    <p className="text-xs text-muted-foreground">
                      {proposal.status === ProposalStatus.Approved
                        ? "Aprovada"
                        : "Recusada"}{" "}
                      por {proposal.reviewedByName || proposal.reviewedBy}
                      {proposal.reviewedAt &&
                        ` em ${formatDate(proposal.reviewedAt)}`}
                    </p>
                  )}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted-foreground">
                    {rotuloDoMaterial(proposal.file)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVisualizar(proposal.file)}
                  >
                    Visualizar
                  </Button>
                  {proposal.status === ProposalStatus.Pending &&
                    podeRevisar && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green2 hover:bg-green2/80"
                          onClick={() => onAprovar(proposal)}
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onRecusar(proposal)}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {fileHistory.length > 0 && (
        <section>
          <h3 className="text-base font-bold text-marine mb-3">
            Versões do material
          </h3>
          <ul className="space-y-2">
            {fileHistory.map((entry) => (
              <li
                key={entry._id}
                className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium break-all">
                    {rotuloDoMaterial(entry.file)}
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
                  onClick={() => onVisualizar(entry.file)}
                >
                  Visualizar
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
