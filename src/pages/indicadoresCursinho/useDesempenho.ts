import { useCallback, useEffect, useState } from "react";
import { type Desempenho, getDesempenho } from "@/services/indicadores";
import { useCursinhoDosIndicadores } from "./cursinhoDosIndicadores";
import { useAuthStore } from "@/store/auth";

/**
 * O desempenho vem numa rota à parte (é mais lento: fala com o ms) — a tela
 * mostra os outros números sem esperar por ele.
 */
export function useDesempenho(periodoId: string) {
  const token = useAuthStore((s) => s.data.token);
  const cursinhoId = useCursinhoDosIndicadores();
  const [dados, setDados] = useState<Desempenho | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(false);
    getDesempenho(token, periodoId, cursinhoId)
      .then((d) => !cancelado && setDados(d))
      .catch(() => !cancelado && setErro(true))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [token, periodoId, cursinhoId]);

  useEffect(carregar, [carregar]);

  return { dados, carregando, erro, carregar };
}
