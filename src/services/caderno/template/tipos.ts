/** O que o ms devolve para uma versão de template. */
export interface VersaoTemplate {
  versao: number;
  status: "rascunho" | "publicada" | "arquivada";
  criadorId: string;
  publicadaEm: string | null;
  notas: string;
  origemVersao: number | null;
}

/**
 * O relatório de um upload.
 *
 * ⚠️ Ele chega com **HTTP 200 mesmo quando `erros` não está vazio**. O rascunho
 * é salvo de qualquer forma, para quem acabou de editar no Overleaf não perder
 * o zip — quem recusa é o publicar. Tratar isto como sucesso liso é o defeito
 * que faz o coordenador achar que publicou.
 */
export interface RelatorioDoRascunho {
  aceitos: string[];
  ignorados: string[];
  erros: string[];
  avisos: string[];
}
