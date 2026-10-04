import { useEffect, useRef, useState } from "react";

export const INTERVALO_MS = 10_000;
export const LIMITE_MS = 90_000;

/**
 * O mês que o "Atualizar mês atual" recalcula: o de hoje, em UTC — o mesmo
 * corte de `listMonthsInPeriod` na api (tickets-documentacao, card 10).
 */
export function mesAtual(hoje: Date = new Date()): string {
  return hoje.toISOString().slice(0, 7);
}

interface Opcoes<T> {
  ativo: boolean;
  consultar: () => Promise<T>;
  /** O recálculo terminou? */
  pronto: (resultado: T) => boolean;
}

/**
 * Consulta a cada 10 s até `pronto` — ou até 90 s, quando `esgotou`
 * (tickets-documentacao, cards 09 e 10). Substitui `useRefreshPolling` e
 * `useRefreshEssayPolling`.
 *
 * ⚠️ O tempo limite vale **mesmo com a consulta falhando**: antes ele só era
 * conferido nas respostas boas, e um erro em toda consulta deixava a tela em
 * "Processando..." para sempre.
 */
export function useAcompanharRecalculo<T>({
  ativo,
  consultar,
  pronto,
}: Opcoes<T>) {
  const [resultado, setResultado] = useState<T | null>(null);
  const [esgotou, setEsgotou] = useState(false);
  // As funções mudam a cada render; o intervalo usa sempre a última.
  const consultarRef = useRef(consultar);
  const prontoRef = useRef(pronto);
  consultarRef.current = consultar;
  prontoRef.current = pronto;

  useEffect(() => {
    setResultado(null);
    setEsgotou(false);
    if (!ativo) return;
    const inicio = Date.now();
    let parado = false;
    const id = setInterval(async () => {
      try {
        const r = await consultarRef.current();
        if (parado) return;
        if (prontoRef.current(r)) {
          parado = true;
          clearInterval(id);
          setResultado(r);
          return;
        }
      } catch {
        // falha passageira: tenta de novo no próximo ciclo
      }
      if (!parado && Date.now() - inicio >= LIMITE_MS) {
        parado = true;
        clearInterval(id);
        setEsgotou(true);
      }
    }, INTERVALO_MS);
    return () => {
      parado = true;
      clearInterval(id);
    };
  }, [ativo]);

  return { resultado, esgotou };
}
