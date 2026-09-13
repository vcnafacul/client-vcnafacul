import type {
  RelatorioDoRascunho,
  VersaoTemplate,
} from "@/services/caderno/template/tipos";

export type TipoDeEstado =
  "sem-rascunho" | "rascunho-com-erro" | "rascunho-limpo";

export interface EstadoDaTela {
  tipo: TipoDeEstado;
  versaoNoAr: number | null;
  podePublicar: boolean;
  podeDescartar: boolean;
  erros: string[];
  avisos: string[];
  ignorados: string[];
  mostrarIgnorados: boolean;
}

/**
 * A máquina de estados da tela do template, pura.
 *
 * ⚠️ `podePublicar` sai de `erros.length === 0`, e de mais nada. Não de
 * `avisos` — aviso não bloqueia foi decisão do dono no card 10, porque chave
 * desbalanceada é a única regra de lint que dá falso positivo em LaTeX válido
 * e o Overleaf já compilou antes do upload.
 *
 * ⚠️ `versaoNoAr` é `null`, não `0`, quando não há versão publicada: com `0` a
 * tela mostraria "versão 0", e esse é o estado real de um ambiente onde o seed
 * ainda não rodou.
 */
export function calcularEstado(entrada: {
  publicada: VersaoTemplate | null;
  relatorio: RelatorioDoRascunho | null;
}): EstadoDaTela {
  const { publicada, relatorio } = entrada;
  const versaoNoAr = publicada === null ? null : publicada.versao;

  if (relatorio === null) {
    return {
      tipo: "sem-rascunho",
      versaoNoAr,
      podePublicar: false,
      podeDescartar: false,
      erros: [],
      avisos: [],
      ignorados: [],
      mostrarIgnorados: false,
    };
  }

  const podePublicar = relatorio.erros.length === 0;

  return {
    tipo: podePublicar ? "rascunho-limpo" : "rascunho-com-erro",
    versaoNoAr,
    podePublicar,
    podeDescartar: true,
    erros: relatorio.erros,
    avisos: relatorio.avisos,
    ignorados: relatorio.ignorados,
    mostrarIgnorados: relatorio.ignorados.length > 0,
  };
}
