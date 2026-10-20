export interface ContentFileHistoryDto {
  _id: string;
  content: string;
  file: {
    _id: string;
    fileKey?: string;
    originalName?: string;
    tipo?: "documento" | "video";
    videoId?: string;
  };
  uploadedBy: string;
  uploadedByName?: string;
  source: "initial_upload" | "proposal_approved";
  proposalId?: string;
  createdAt: string;
}
