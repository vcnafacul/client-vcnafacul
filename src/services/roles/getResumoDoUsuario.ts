import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export interface InscricaoDoResumo {
  cursinho: { id: string; nome: string } | null;
  processo: { id: string; nome: string } | null;
  status: string;
  turma: string | null;
  em: string;
}

/** `GET /user/:id/resumo` — card 04 de `tela-de-usuarios`. */
export interface ResumoDoUsuario {
  conta: {
    id: string;
    nome: string;
    nomeSocial: string | null;
    usaNomeSocial: boolean;
    email: string;
    telefone: string;
    cidade: string;
    uf: string;
    cadastradoEm: string;
    ultimoAcesso: string | null;
    emailConfirmado: boolean;
    desativada: boolean;
    funcao: { id: string; nome: string } | null;
  };
  colaborador: {
    cursinho: { id: string; nome: string } | null;
    ativo: boolean;
    desde: string;
  } | null;
  estudante: {
    atual: InscricaoDoResumo[];
    historico: InscricaoDoResumo[];
  };
}

export async function getResumoDoUsuario(
  userId: string,
  token: string,
): Promise<ResumoDoUsuario> {
  const response = await fetchWrapper(
    `${user}/${encodeURIComponent(userId)}/resumo`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o resumo do usuário");
  }
  return await response.json();
}
