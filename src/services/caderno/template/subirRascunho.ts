import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";
import { RelatorioDoRascunho } from "./tipos";

/**
 * Sobe o zip do projeto do Overleaf como rascunho do template.
 *
 * ⚠️ **O `200` não quer dizer que passou no lint.** A api responde `200` com
 * `erros` preenchido de propósito: o rascunho é salvo de qualquer jeito, para
 * quem acabou de editar no Overleaf não perder o zip — quem recusa é o
 * `publicar`. Por isso este service **devolve o relatório** em vez de lançar:
 * um service que tratasse `erros` como falha (ou que devolvesse só "ok") faria
 * a tela dizer "enviado com sucesso", o coordenador fecharia o modal achando
 * que publicou, e a prova seguinte sairia com o template velho sem nada falhar.
 */
export async function subirRascunho(
  arquivo: File,
  notas: string,
  token: string,
): Promise<RelatorioDoRascunho> {
  const formData = new FormData();
  formData.append("arquivo", arquivo);
  if (notas.trim()) formData.append("notas", notas);

  const response = await fetchWrapper(`${cadernoTemplate}/rascunho`, {
    method: "POST",
    // sem Content-Type → o browser põe o boundary do multipart. Declarar o
    // header o substitui por um sem boundary e o servidor recebe um corpo que
    // não parseia. Mesmo padrão do uploadCartao.ts.
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  // Só erro de transporte/validação (413, 415, 500…) vira exceção. O lint
  // reprovado chega em `erros`, dentro do relatório, com status 200.
  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Não foi possível enviar o rascunho"),
    );
  }

  return response.json();
}
