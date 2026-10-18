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
  /** tickets/043, card 06 (ms): a categoria é própria do cursinho de quem pede. */
  categoriaDoMeuCursinho?: boolean;
  categoria?: {
    _id: string;
    nome: string;
    /** `system`, `Cursinho` (compartilhada) ou o id de um cursinho. */
    dono?: string | null;
    exame?: { _id: string; nome: string } | string | null;
  } | string | null;
}
export interface Opcao {
  _id: string;
  nome: string;
}

/** Os grupos do campo Categoria, nesta ordem (tickets/043, card 07). */
export type GrupoDaCategoria = "system" | "cursinho" | "meu";
export const GRUPOS_DE_CATEGORIA: { grupo: GrupoDaCategoria; titulo: string }[] = [
  { grupo: "system", titulo: "System" },
  { grupo: "cursinho", titulo: "Cursinho" },
  { grupo: "meu", titulo: "Meu cursinho" },
];

/**
 * Em que grupo a categoria entra — ou `null`, e ela não aparece: categoria
 * própria de OUTRO cursinho não é da conta de quem filtra (card 07).
 */
export function grupoDaCategoria(
  cat: { dono?: string | null },
  doMeuCursinho: boolean,
): GrupoDaCategoria | null {
  if (cat.dono === "system") return "system";
  if (cat.dono === "Cursinho") return "cursinho";
  return doMeuCursinho ? "meu" : null;
}

const categoriaDe = (p: ProvaDoFiltro) =>
  p.categoria && typeof p.categoria === "object" ? p.categoria : null;
const exameDe = (p: ProvaDoFiltro) => {
  const e = categoriaDe(p)?.exame;
  return e && typeof e === "object" ? e : null;
};
const porNome = (a: Opcao, b: Opcao) => a.nome.localeCompare(b.nome, "pt-BR");

/**
 * "Enem Dia 1 (system)" / "Enem Dia 1 (cursinho)": o dono no rótulo, só para os
 * dois donos fixos. Categoria de um cursinho (dono = id dele) fica só com o nome.
 */
export function rotuloDaCategoria(cat: { nome: string; dono?: string | null }): string {
  if (cat.dono === "system") return `${cat.nome} (system)`;
  if (cat.dono === "Cursinho") return `${cat.nome} (cursinho)`;
  return cat.nome;
}

/**
 * As opções de Exame, Categoria e Prova a partir das provas que a pessoa vê
 * (tickets/043): só aparece exame/categoria que tem prova. Exame filtra
 * Categoria e Prova; Categoria filtra Prova.
 *
 * ⚠️ Há categorias com o mesmo nome e donos diferentes ("Enem Dia 1" da
 * plataforma e a compartilhada com os cursinhos): o rótulo leva o dono quando
 * ele é `system` ou `Cursinho` — ver `rotuloDaCategoria`.
 */
export function opcoesDoFiltro(
  provas: ProvaDoFiltro[],
  filtro: Pick<FilterValues, "exame" | "categoria">,
): {
  exames: Opcao[];
  /** Na ordem dos grupos (system → cursinho → meu cursinho), e por nome dentro de cada. */
  categorias: Opcao[];
  gruposDeCategorias: { grupo: GrupoDaCategoria; titulo: string; itens: Opcao[] }[];
  provas: Opcao[];
} {
  const exames = new Map<string, Opcao>();
  const categorias = new Map<string, Opcao & { grupo: GrupoDaCategoria }>();
  const lista: Opcao[] = [];
  for (const p of provas) {
    const ex = exameDe(p);
    const cat = categoriaDe(p);
    if (ex) exames.set(ex._id, { _id: ex._id, nome: ex.nome });
    const doExame = !filtro.exame || ex?._id === filtro.exame;
    const grupo = cat ? grupoDaCategoria(cat, p.categoriaDoMeuCursinho === true) : null;
    if (cat && doExame && grupo && !categorias.has(cat._id)) {
      categorias.set(cat._id, { _id: cat._id, nome: rotuloDaCategoria(cat), grupo });
    }
    if (doExame && (!filtro.categoria || cat?._id === filtro.categoria)) {
      lista.push({ _id: p._id, nome: p.nome });
    }
  }
  const gruposDeCategorias = GRUPOS_DE_CATEGORIA.map((g) => ({
    ...g,
    itens: [...categorias.values()]
      .filter((c) => c.grupo === g.grupo)
      .map(({ _id, nome }) => ({ _id, nome }))
      .sort(porNome),
  })).filter((g) => g.itens.length > 0);
  return {
    exames: [...exames.values()].sort(porNome),
    categorias: gruposDeCategorias.flatMap((g) => g.itens),
    gruposDeCategorias,
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
