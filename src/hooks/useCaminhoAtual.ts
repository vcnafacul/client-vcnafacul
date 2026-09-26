import { useLocation } from "react-router-dom";

/**
 * O caminho atual com a query — o `voltar` do botão do Google (card 04 de
 * `login-com-google`): a ida ao Google recarrega a página, e sem ele a pessoa
 * cairia no dashboard, fora do fluxo em que estava.
 */
export function useCaminhoAtual(): string {
  const { pathname, search } = useLocation();
  return pathname + search;
}
