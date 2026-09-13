import type {
  RelatorioDoRascunho,
  VersaoTemplate,
} from "@/services/caderno/template/tipos";

export type TipoDeEstado =
  | "carregando"
  | "sem-rascunho"
  | "rascunho-sem-relatorio"
  | "rascunho-com-erro"
  | "rascunho-limpo";

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
 *
 * ⚠️ `carregando` vence os outros ramos, e por isso mora aqui e não no
 * componente: o estado vazio desta tela não é neutro, ele diz "nenhuma versão
 * publicada". Piscar isso a cada abertura do modal treina o coordenador a
 * ignorar o aviso que mais importa.
 *
 * ⚠️ **Rascunho salvo sem relatório em mãos PUBLICA.** O relatório de lint só
 * existe logo depois de um upload, e não há endpoint que o devolva para um
 * rascunho salvo antes — mas isso não faz dele um rascunho de estado
 * desconhecido: o `publicar` roda o lint **de novo**, de propósito (card 10),
 * porque o rascunho pode ter vindo de uma restauração feita antes de uma regra
 * nova existir. O servidor é a autoridade nesse momento, e o veredito sai no
 * clique — reprovou, volta `409` com a lista, ela entra em `relatorio.erros` e
 * o botão desliga por este mesmo cálculo.
 *
 * E o caso não é raro: é o resultado normal do "Restaurar" (aba de histórico).
 * Exigir "envie o zip de novo para revisar" depois de restaurar seria absurdo —
 * a pessoa restaurou justamente porque não tem o zip.
 *
 * ⚠️ **A precedência**: `carregando` vence tudo; havendo relatório em mãos, o
 * relatório manda, porque ele é mais fresco que o documento salvo; só na
 * ausência dele é que `rascunhoSalvo` decide. Inverter as duas últimas faria o
 * estado velho mascarar o novo — um upload reprovado voltaria a oferecer
 * Publicar.
 *
 * Erro de rede (500, timeout) **não** entra na máquina: o padrão do repo é
 * `.catch(erro => toast.error(erro.message))`. Um segundo canal para o mesmo
 * erro daria duas formas de reportar a mesma coisa, e elas divergem. O 503 é
 * outra coisa — não é falha, é "ninguém publicou ainda" — e já vem tratado do
 * `obterPublicada` como `publicada: null`.
 */
export function calcularEstado(entrada: {
  carregando: boolean;
  publicada: VersaoTemplate | null;
  /** O que o `obterRascunho` devolveu: o rascunho salvo no servidor, se houver. */
  rascunhoSalvo: VersaoTemplate | null;
  relatorio: RelatorioDoRascunho | null;
}): EstadoDaTela {
  const { carregando, publicada, rascunhoSalvo, relatorio } = entrada;
  const versaoNoAr = publicada === null ? null : publicada.versao;

  // Vence os outros ramos: não se publica nem se descarta o que ainda não se
  // sabe, e o vazio não pode ser confundido com "nenhuma versão publicada".
  if (carregando) {
    return {
      tipo: "carregando",
      versaoNoAr,
      podePublicar: false,
      podeDescartar: false,
      erros: [],
      avisos: [],
      ignorados: [],
      mostrarIgnorados: false,
    };
  }

  // ⚠️ O relatório vem ANTES do rascunho salvo: ele é o mais fresco dos dois.
  // Na ordem inversa, o documento salvo mascararia um upload recém-reprovado e
  // a tela voltaria a oferecer Publicar.
  if (relatorio === null) {
    if (rascunhoSalvo !== null) {
      return {
        tipo: "rascunho-sem-relatorio",
        versaoNoAr,
        // O lint roda de novo no publicar; quem recusa é o 409, não a tela.
        podePublicar: true,
        podeDescartar: true,
        erros: [],
        avisos: [],
        ignorados: [],
        mostrarIgnorados: false,
      };
    }

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
