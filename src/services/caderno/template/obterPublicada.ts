import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";
import { VersaoTemplate } from "./tipos";

/**
 * A versão do template em vigor, ou `null` quando ninguém publicou ainda.
 *
 * ⚠️ **O "ainda não há versão publicada" chega como `503`, não como `404`.** O
 * ms lança `ServiceUnavailableException` nesse caso
 * (`caderno-template.service.ts:60-68`) e a api repassa cru
 * (`caderno-template.controller.ts:71-73`). Apesar do status, **não é
 * indisponibilidade de serviço**: é o estado legítimo de uma plataforma onde
 * ninguém publicou template nenhum — e é o estado de **homologação hoje**, com
 * a coleção e os índices criados e o seed ainda não rodado. Tratar como erro
 * faz a primeira pessoa que abrir a tela em homol receber um 503 solto e o
 * modal quebrar, em vez de ler "nenhuma versão publicada ainda".
 *
 * ⚠️ O `404` fica de fora de propósito: esta rota não devolve 404 hoje, e se um
 * dia devolver é outra coisa (rota errada, proxy) — engolir os dois esconderia
 * um defeito real.
 */
export async function obterPublicada(
  token: string,
): Promise<VersaoTemplate | null> {
  const response = await fetchWrapper(cadernoTemplate, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 503) return null;
  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Erro ao carregar o template publicado"),
    );
  }

  return response.json();
}
