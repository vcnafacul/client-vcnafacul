export type TipoDeEvento =
  | "criada"
  | "enviada"
  | "aprovada"
  | "rejeitada"
  | "resetada"
  | "proposta_enviada"
  | "proposta_aprovada"
  | "proposta_recusada"
  | "material_substituido"
  | "outro";

export interface MaterialDoEvento {
  fileContentId: string;
  tipo: "documento" | "video";
  originalName?: string;
  videoId?: string;
}

/** Um ponto da linha do tempo da demanda (`GET /content/:id/timeline`, api 050/02). */
export interface EventoDaTimeline {
  tipo: TipoDeEvento;
  /** ISO. */
  em: string;
  porId: string;
  /** Nome resolvido; igual ao id quando o usuário não existe mais. */
  por: string;
  detalhe?: string;
  material?: MaterialDoEvento;
  proposalId?: string;
}
