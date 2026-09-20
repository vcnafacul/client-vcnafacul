import type { EstudanteEncontrado } from "@/dtos/cartaoResposta/buscaEstudante";
import { buscarEstudantes } from "@/services/cartaoResposta/buscarEstudantes";
import { useEffect, useRef, useState } from "react";

/** Espelha o `MINIMO_DE_CARACTERES` do serviço da api. */
export const MINIMO_PARA_BUSCAR = 3;

/** Quanto tempo sem digitar antes de consultar. */
export const DEBOUNCE_MS = 500;

export type EstadoDaBusca = "parado" | "buscando" | "pronto" | "erro";

/**
 * Busca estudantes enquanto se digita, sem botão.
 *
 * ⚠️ **O debounce é de 500ms e conta a partir da ÚLTIMA tecla.** Sem ele, uma
 * matrícula de oito dígitos dispararia seis consultas — e as respostas voltam
 * fora de ordem, então a lista piscaria entre resultados de termos diferentes.
 */
export function useBuscaDeEstudantes(termo: string, token: string) {
  const [estudantes, setEstudantes] = useState<EstudanteEncontrado[]>([]);
  const [estado, setEstado] = useState<EstadoDaBusca>("parado");

  /**
   * ⚠️ Guarda qual termo originou a busca em voo. Sem isto, uma resposta lenta
   * de "20250" chegando depois da de "20250185" sobrescreveria a lista certa
   * com a antiga — o defeito clássico de autocomplete, e o mais difícil de
   * reproduzir à mão porque depende da rede estar lenta na hora certa.
   */
  const termoEmVoo = useRef<string>("");

  useEffect(() => {
    const limpo = termo.trim();

    if (limpo.length < MINIMO_PARA_BUSCAR) {
      // ⚠️ Apagar a lista aqui é o certo: manter as sugestões de um termo que
      // não existe mais deixa a pessoa clicar em alguém que ela não procurou.
      setEstudantes([]);
      setEstado("parado");
      termoEmVoo.current = "";
      return;
    }

    setEstado("buscando");
    const id = setTimeout(() => {
      termoEmVoo.current = limpo;
      buscarEstudantes(limpo, token)
        .then((r) => {
          if (termoEmVoo.current !== limpo) return;
          setEstudantes(r.estudantes);
          setEstado("pronto");
        })
        .catch(() => {
          if (termoEmVoo.current !== limpo) return;
          setEstudantes([]);
          setEstado("erro");
        });
    }, DEBOUNCE_MS);

    // ⚠️ Cancela o disparo pendente a cada tecla — é isto que faz o debounce
    // contar do último caractere, e não do primeiro.
    return () => clearTimeout(id);
  }, [termo, token]);

  return { estudantes, estado };
}
