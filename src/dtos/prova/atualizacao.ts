import { StatusEnum } from "@/enums/generic/statusEnum";

/**
 * Uma questão da prova com versão mais nova disponível (tickets/023, card 13).
 * A oferta é a ÚLTIMA versão da cadeia — inclusive em revisão.
 */
export interface Atualizacao {
  numero: number | null;
  atual: { _id: string; status: StatusEnum };
  oferta: { _id: string; status: StatusEnum; criadaEm?: string; saltos: number };
  /** A cadeia parou numa versão cuja seguinte foi excluída. */
  cadeiaInterrompida: boolean;
  /** Campos de conteúdo que mudaram (`textoQuestao`, `alternativa`…). */
  camposAlterados: string[];
}

export interface AtualizacoesDaProva {
  podeComporProva: boolean;
  atualizacoes: Atualizacao[];
}
