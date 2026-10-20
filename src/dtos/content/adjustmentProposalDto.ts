export enum ProposalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface AdjustmentProposalDto {
  _id: string;
  content: string;
  file: {
    _id: string;
    fileKey?: string;
    originalName?: string;
    tipo?: "documento" | "video";
    videoId?: string;
  };
  status: ProposalStatus;
  author: string;
  authorName?: string;
  comment?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  /** Quando foi revisada (050/01); propostas antigas não têm. */
  reviewedAt?: string;
  createdAt: string;
}
