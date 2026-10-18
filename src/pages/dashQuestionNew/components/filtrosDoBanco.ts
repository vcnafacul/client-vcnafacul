import { StatusEnum } from "@/enums/generic/statusEnum";

/** tickets/042, card 08: os valores da URL não mudaram com o rótulo novo (043). */
export type FiltroDeAnulada = "todas" | "esconder" | "somente";

/**
 * As flags de "Revisões necessárias" que o banco filtra (tickets/043).
 * ⚠️ `alternativeClassfication` é o nome do campo no ms (sic).
 */
export const REVISOES_DO_FILTRO = [
  { campo: "provaClassification", rotulo: "Classificação da Prova" },
  { campo: "subjectClassification", rotulo: "Classificação de Disciplinas e Frentes" },
  { campo: "reported", rotulo: "Report" },
  { campo: "textClassification", rotulo: "Texto da Questão/Alternativas" },
  { campo: "alternativeClassfication", rotulo: "Alternativa Correta" },
] as const;
export type RevisaoDoFiltro = (typeof REVISOES_DO_FILTRO)[number]["campo"];

/** O texto do gatilho: "Nenhuma", o nome da única marcada, ou "N marcadas". */
export function resumoDasRevisoes(marcadas: RevisaoDoFiltro[]): string {
  if (!marcadas.length) return "Nenhuma";
  if (marcadas.length === 1) {
    return REVISOES_DO_FILTRO.find((r) => r.campo === marcadas[0])?.rotulo ?? "1 marcada";
  }
  return `${marcadas.length} marcadas`;
}

export const OPCOES_DE_ANULADA: { valor: FiltroDeAnulada; rotulo: string }[] = [
  { valor: "todas", rotulo: "Mostrar" },
  { valor: "esconder", rotulo: "Esconder" },
  { valor: "somente", rotulo: "Só elas" },
];

export interface FilterValues {
  status: StatusEnum;
  materia: string;
  frente: string;
  prova: string;
  enemArea: string;
  filterText: string;
  /** tickets/042, card 08 — rótulo "Questões anuladas" desde o 043. */
  anulada: FiltroDeAnulada;
  /** tickets/043. */
  exame: string;
  categoria: string;
  revisoes: RevisaoDoFiltro[];
  /** Só as questões SEM imagem da questão (`imageId` vazio). */
  semImagem: boolean;
}

export const FILTROS_VAZIOS: FilterValues = {
  status: StatusEnum.All,
  materia: "",
  frente: "",
  prova: "",
  enemArea: "",
  filterText: "",
  anulada: "todas",
  exame: "",
  categoria: "",
  revisoes: [],
  semImagem: false,
};

export function temFiltroAtivo(f: FilterValues): boolean {
  return (
    f.status !== StatusEnum.All ||
    !!f.materia ||
    !!f.frente ||
    !!f.prova ||
    !!f.enemArea ||
    !!f.filterText ||
    f.anulada !== "todas" ||
    !!f.exame ||
    !!f.categoria ||
    f.revisoes.length > 0 ||
    f.semImagem
  );
}

/** O mínimo de uma prova de `infos.provas` que a cascata usa. */
export interface ProvaDoFiltro {
  _id: string;
  nome: string;
  categoria?: { _id: string; nome: string; exame?: { _id: string; nome: string } | string | null } | string | null;
}
export interface Opcao {
  _id: string;
  nome: string;
}

const categoriaDe = (p: ProvaDoFiltro) =>
  p.categoria && typeof p.categoria === "object" ? p.categoria : null;
const exameDe = (p: ProvaDoFiltro) => {
  const e = categoriaDe(p)?.exame;
  return e && typeof e === "object" ? e : null;
};
const porNome = (a: Opcao, b: Opcao) => a.nome.localeCompare(b.nome, "pt-BR");

/**
 * As opções de Exame, Categoria e Prova a partir das provas que a pessoa vê
 * (tickets/043): só aparece exame/categoria que tem prova. Exame filtra
 * Categoria e Prova; Categoria filtra Prova.
 *
 * ⚠️ Sem exame escolhido, duas categorias de exames diferentes podem ter o mesmo
 * nome ("Dia 1"): a categoria leva o exame no rótulo.
 */
export function opcoesDoFiltro(
  provas: ProvaDoFiltro[],
  filtro: Pick<FilterValues, "exame" | "categoria">,
): { exames: Opcao[]; categorias: Opcao[]; provas: Opcao[] } {
  const exames = new Map<string, Opcao>();
  const categorias = new Map<string, Opcao>();
  const lista: Opcao[] = [];
  for (const p of provas) {
    const ex = exameDe(p);
    const cat = categoriaDe(p);
    if (ex) exames.set(ex._id, { _id: ex._id, nome: ex.nome });
    const doExame = !filtro.exame || ex?._id === filtro.exame;
    if (cat && doExame) {
      categorias.set(cat._id, {
        _id: cat._id,
        nome: !filtro.exame && ex ? `${cat.nome} · ${ex.nome}` : cat.nome,
      });
    }
    if (doExame && (!filtro.categoria || cat?._id === filtro.categoria)) {
      lista.push({ _id: p._id, nome: p.nome });
    }
  }
  return {
    exames: [...exames.values()].sort(porNome),
    categorias: [...categorias.values()].sort(porNome),
    provas: lista.sort(porNome),
  };
}

/**
 * Trocar Exame ou Categoria limpa o que deixou de casar (tickets/043): a
 * categoria de outro exame e a prova que saiu da lista. A troca de prova
 * continua limpando Área, Matéria e Frente, como antes.
 */
export function ajustarCascata(
  filtro: FilterValues,
  provas: ProvaDoFiltro[],
): FilterValues {
  const o = opcoesDoFiltro(provas, { exame: filtro.exame, categoria: "" });
  const categoria = o.categorias.some((c) => c._id === filtro.categoria) ? filtro.categoria : "";
  const daProva = opcoesDoFiltro(provas, { exame: filtro.exame, categoria });
  const prova = daProva.provas.some((p) => p._id === filtro.prova) ? filtro.prova : "";
  const limpouProva = !!filtro.prova && !prova;
  return {
    ...filtro,
    categoria,
    prova,
    ...(limpouProva ? { enemArea: "", materia: "", frente: "" } : {}),
  };
}
