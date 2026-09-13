import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";

/** Qual template compilar: uma versão específica, o rascunho, ou a publicada. */
export interface OpcoesDoModelo {
  versao?: number;
  rascunho?: boolean;
}

/**
 * Baixa o zip de teste (o modelo compilado) de um template.
 *
 * Sem opção nenhuma, o ms usa a versão publicada.
 */
export async function baixarModelo(
  opcoes: OpcoesDoModelo,
  token: string,
): Promise<Blob> {
  const params = new URLSearchParams();
  if (opcoes.versao !== undefined) params.set("versao", String(opcoes.versao));
  if (opcoes.rascunho) params.set("rascunho", "1");
  const query = params.toString();

  const response = await fetchWrapper(
    `${cadernoTemplate}/teste${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // ⚠️ Sucesso é binário, erro é JSON, e o corpo só pode ser lido UMA vez.
  // A decisão é pelo `response.ok`, ANTES de tocar no corpo: ler o errado
  // consome o stream e o download quebra. Mesmo do baixarCaderno.ts (card 06).
  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Erro ao baixar o modelo de teste"),
    );
  }

  return response.blob();
}
