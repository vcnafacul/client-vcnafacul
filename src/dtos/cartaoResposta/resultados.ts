export interface EstudanteCartao {
  userId: string;
  nome: string;
  matricula: string;
}

export interface ResultadosCartao {
  estudante: EstudanteCartao;
  historicos: Array<{ ano?: number; status?: string }>;
}
