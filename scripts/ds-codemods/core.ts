// Núcleo dos codemods do design system (tickets/059 §7.3): acha as listas de classes num arquivo
// ts/tsx pelo AST do TypeScript, aplica as regras de uma varredura e deixa /* ds-review */ onde a
// troca é manual.
import ts from "typescript";
import { rules } from "../../src/design-system/guard/rules";

export type Contagem = { trocas: number; revisoes: number };

export type Resultado = {
  code: string;
  /** Marcadores /* ds-review *\/ inseridos nesta execução. */
  reviews: number;
  replacements: number;
  porRegra: Record<string, Contagem>;
};

export class Placar {
  porRegra: Record<string, Contagem> = {};

  private da(regra: string): Contagem {
    return (this.porRegra[regra] ??= { trocas: 0, revisoes: 0 });
  }
  troca(regra: string, n = 1) {
    this.da(regra).trocas += n;
  }
  revisao(regra: string) {
    this.da(regra).revisoes += 1;
  }
  get trocas() {
    return Object.values(this.porRegra).reduce((s, c) => s + c.trocas, 0);
  }
}

// ---- tokens ----

export class Token {
  readonly prefixo: string; // variantes com o ":" final, ex.: "md:hover:"
  readonly importante: boolean;
  readonly util: string;
  saida?: string[];
  revisao?: { regra: string; motivo: string };

  constructor(
    readonly raw: string,
    readonly parcial: boolean,
  ) {
    let fundo = 0;
    let ultimo = -1;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (c === "[" || c === "(") fundo++;
      else if (c === "]" || c === ")") fundo--;
      else if (c === ":" && fundo === 0) ultimo = i;
    }
    this.prefixo = raw.slice(0, ultimo + 1);
    const resto = raw.slice(ultimo + 1);
    this.importante = resto.startsWith("!");
    this.util = this.importante ? resto.slice(1) : resto;
  }

  get variantes(): string[] {
    return this.prefixo ? this.prefixo.slice(0, -1).split(":") : [];
  }
  /** Sem variante, ou só de breakpoint (sm:, md:, …). */
  get soResponsivo(): boolean {
    return this.variantes.every((v) => /^(?:max-)?(?:sm|md|lg|xl|2xl)$/.test(v));
  }
  get mexido(): boolean {
    return this.saida !== undefined || this.revisao !== undefined;
  }

  troca(util: string, regra: string, placar: Placar) {
    this.saida = [this.prefixo + (this.importante ? "!" : "") + util];
    placar.troca(regra);
  }
  remove(regra: string, placar: Placar) {
    this.saida = [];
    placar.troca(regra);
  }
  revisa(motivo: string, regra: string, placar: Placar) {
    this.revisao = { regra, motivo };
    placar.revisao(regra);
  }
}

/** Separa "cor/opacidade" na última "/" fora de colchetes. */
export function semOpacidade(valor: string): [string, string] {
  let fundo = 0;
  for (let i = valor.length - 1; i >= 0; i--) {
    const c = valor[i];
    if (c === "]") fundo++;
    else if (c === "[") fundo--;
    else if (c === "/" && fundo === 0) return [valor.slice(0, i), valor.slice(i)];
  }
  return [valor, ""];
}

/** Uma lista de classes: o conteúdo de uma string ou de um pedaço de template literal. */
export class Lista {
  readonly tokens: Token[] = [];
  private readonly antes: string[] = []; // espaço antes de cada token (o do primeiro é o início do texto)
  private readonly fim: string;

  constructor(texto: string, parcialInicio = false, parcialFim = false) {
    const re = /\S+/g;
    let ultimo = 0;
    let m: RegExpExecArray | null;
    const achados: RegExpExecArray[] = [];
    while ((m = re.exec(texto))) achados.push(m);
    achados.forEach((a, i) => {
      const parcial =
        (i === 0 && parcialInicio && a.index === 0) ||
        (i === achados.length - 1 && parcialFim && a.index + a[0].length === texto.length);
      this.antes.push(texto.slice(ultimo, a.index));
      this.tokens.push(new Token(a[0], parcial));
      ultimo = a.index + a[0].length;
    });
    this.fim = texto.slice(ultimo);
  }

  get ativos(): Token[] {
    return this.tokens.filter((t) => !t.parcial);
  }
  tem(re: RegExp): boolean {
    return this.ativos.some((t) => re.test(t.raw));
  }
  get mudou(): boolean {
    return this.tokens.some((t) => t.saida !== undefined && t.saida.join(" ") !== t.raw);
  }

  render(): string {
    let saida = "";
    let pendente: string | null = null; // espaço inicial herdado de tokens removidos no começo
    let emitiu = false;
    this.tokens.forEach((t, i) => {
      const texto = (t.saida ?? [t.raw]).join(" ");
      if (!texto) {
        if (!emitiu && pendente === null) pendente = this.antes[i];
        return;
      }
      saida += (!emitiu && pendente !== null ? pendente : this.antes[i]) + texto;
      emitiu = true;
    });
    if (!emitiu && pendente !== null) saida += pendente;
    return saida + this.fim;
  }
}

// ---- classificação das strings ----

const FUNCOES_DE_CLASSE = /^(?:cn|clsx|classnames|classNames|twMerge|twJoin|cva|tv|cx)$/;
const NOME_DE_CLASSE = /^(?:class|className|classNames|[A-Za-z]*ClassName|[A-Za-z]*Classes)$/;
const VARIAVEL_DE_CLASSE = /(?:class|classe|classes|className|Class|Classe|Classes|ClassName)$/;

function nomeDe(n: ts.Node | undefined): string | undefined {
  if (!n) return undefined;
  if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isPrivateIdentifier(n)) return n.text;
  if (ts.isPropertyAccessExpression(n)) return n.name.text;
  if (ts.isJsxNamespacedName(n)) return n.name.text;
  return undefined;
}

/**
 * true quando a string está num contexto de classe: atributo className (ou *ClassName),
 * argumento de cn/clsx/cva/tv, propriedade className/class, ou variável terminada em "class".
 * Sobe pelas expressões que só repassam o valor (ternário, &&, ||, +, template, array, objeto).
 */
export function emContextoDeClasse(no: ts.Node): boolean {
  let atual: ts.Node = no;
  for (let p = no.parent; p; atual = p, p = p.parent) {
    if (ts.isJsxAttribute(p)) return NOME_DE_CLASSE.test(nomeDe(p.name) ?? "");
    if (
      ts.isJsxExpression(p) ||
      ts.isParenthesizedExpression(p) ||
      ts.isAsExpression(p) ||
      ts.isSatisfiesExpression(p) ||
      ts.isNonNullExpression(p) ||
      ts.isTemplateSpan(p) ||
      ts.isTemplateExpression(p) ||
      ts.isArrayLiteralExpression(p) ||
      ts.isSpreadElement(p) ||
      ts.isObjectLiteralExpression(p)
    )
      continue;
    if (ts.isConditionalExpression(p)) {
      if (atual === p.condition) return false;
      continue;
    }
    if (ts.isBinaryExpression(p)) {
      const op = p.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        if (atual === p.left) return false;
        continue;
      }
      if (
        op === ts.SyntaxKind.BarBarToken ||
        op === ts.SyntaxKind.QuestionQuestionToken ||
        op === ts.SyntaxKind.PlusToken
      )
        continue;
      return false;
    }
    if (ts.isPropertyAssignment(p)) {
      const chave = nomeDe(p.name) ?? "";
      if (atual === p.initializer) {
        if (NOME_DE_CLASSE.test(chave)) return true;
        // valores de compoundVariants/defaultVariants são nomes de variante, não classes
        if (chave === "compoundVariants" || chave === "defaultVariants") return false;
      }
      continue;
    }
    if (ts.isCallExpression(p)) {
      return atual !== p.expression && FUNCOES_DE_CLASSE.test(nomeDe(p.expression) ?? "");
    }
    if (ts.isVariableDeclaration(p)) {
      return atual === p.initializer && VARIAVEL_DE_CLASSE.test(nomeDe(p.name) ?? "");
    }
    return false;
  }
  return false;
}

/** Posições onde uma string nunca é lista de classes. */
function posicaoProibida(no: ts.Node): boolean {
  const p = no.parent;
  if (!p) return true;
  if (
    ts.isImportDeclaration(p) ||
    ts.isExportDeclaration(p) ||
    ts.isExternalModuleReference(p) ||
    ts.isImportAttribute?.(p) ||
    ts.isLiteralTypeNode(p) ||
    ts.isPropertySignature(p) ||
    ts.isEnumMember(p) ||
    ts.isCaseClause(p) ||
    ts.isElementAccessExpression(p) ||
    ts.isTaggedTemplateExpression(p)
  )
    return true;
  // atributo de elemento HTML (data-*, aria-*, title…) nunca é classe; prop de componente pode ser
  if (ts.isJsxAttribute(p) && !NOME_DE_CLASSE.test(nomeDe(p.name) ?? "")) {
    const tag = p.parent.parent;
    if (/^(?:data|aria)-/.test(p.name.getText()) || /^[a-z]/.test(tag.tagName.getText())) return true;
  }
  if (ts.isCallExpression(p) && (p.expression.kind === ts.SyntaxKind.ImportKeyword || nomeDe(p.expression) === "require"))
    return true;
  if (ts.isBinaryExpression(p)) {
    const op = p.operatorToken.kind;
    if (
      op === ts.SyntaxKind.EqualsEqualsEqualsToken ||
      op === ts.SyntaxKind.ExclamationEqualsEqualsToken ||
      op === ts.SyntaxKind.EqualsEqualsToken ||
      op === ts.SyntaxKind.ExclamationEqualsToken
    )
      return true;
  }
  for (let a: ts.Node | undefined = p; a; a = a.parent) if (ts.isTypeNode(a) && !ts.isExpressionWithTypeArguments(a)) return true;
  return false;
}

const PARECE_CLASSE = /^[!-]?[a-z0-9@[*&][^\s"'`\\{}<>]*$/;

/** Heurística fora de contexto de classe: todo token tem cara de classe e há ao menos um utilitário composto. */
export function pareceListaDeClasses(tokens: Token[]): boolean {
  const ativos = tokens.filter((t) => !t.parcial);
  if (!ativos.length) return false;
  if (!ativos.every((t) => PARECE_CLASSE.test(t.raw) && !t.raw.includes("//") && !/[.,;]$/.test(t.raw))) return false;
  return ativos.length >= 2 || ativos.some((t) => /[-:]/.test(t.raw));
}

// ---- consulta ao guard (o que conta como legado) ----

const regra = (id: string) => rules.find((r) => r.id === id)!;
const GUARD_COR = regra("legacy-color");
const GUARD_TAMANHO = regra("legacy-size");
const GUARD_ESPACO = regra("arbitrary-spacing");
const GUARD_ELEVACAO = regra("flagged-elevation");

export const legado = {
  cor: (t: Token) => GUARD_COR.match(t.raw, "") > 0,
  tamanho: (t: Token) => GUARD_TAMANHO.match(t.raw, "") > 0,
  espaco: (t: Token) => GUARD_ESPACO.match(t.raw, "") > 0,
  elevacao: (t: Token, file: string) => GUARD_ELEVACAO.match(t.raw, file) > 0,
};

export const HOME = (file: string) => file.startsWith("src/pages/homeV2/");

// ---- aplicação ----

export type Contexto = { file: string; placar: Placar };
export type ProcessarLista = (lista: Lista, ctx: Contexto) => void;
/** Revisão de strings que não são listas de classes (ex.: hex cru); devolve motivos. */
export type RevisarTexto = (texto: string, no: ts.Node, ctx: Contexto) => string[];

type Pedaco = { inicio: number; fim: number; texto: string; parcialInicio: boolean; parcialFim: boolean };
export type Edicao = { inicio: number; fim: number; texto: string };

export const JA_MARCADO = /^\s*\/\*\s*ds-review/;

export function aplicarEdicoes(source: string, edicoes: Edicao[]): string {
  let out = source;
  for (const e of [...edicoes].sort((a, b) => b.inicio - a.inicio || b.fim - a.fim))
    out = out.slice(0, e.inicio) + e.texto + out.slice(e.fim);
  return out;
}

export const marcador = (motivos: string[]) =>
  ` /* ds-review: ${[...new Set(motivos)].join("; ").replace(/\*\//g, "* /")} */`;

export function criarSourceFile(source: string, file: string) {
  return ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function pedacos(no: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression, sf: ts.SourceFile): Pedaco[] {
  const src = sf.text;
  const de = (n: ts.Node, abre: number, fecha: number, pi: boolean, pf: boolean): Pedaco => {
    const inicio = n.getStart(sf) + abre;
    const fim = n.end - fecha;
    return { inicio, fim, texto: src.slice(inicio, fim), parcialInicio: pi, parcialFim: pf };
  };
  if (!ts.isTemplateExpression(no)) return [de(no, 1, 1, false, false)];
  const lista = [de(no.head, 1, 2, false, true)];
  for (const span of no.templateSpans) {
    const lit = span.literal;
    lista.push(ts.isTemplateTail(lit) ? de(lit, 1, 1, true, false) : de(lit, 1, 2, true, true));
  }
  return lista;
}

export function transformarClasses(
  source: string,
  file: string,
  processar: ProcessarLista,
  revisarTexto?: RevisarTexto,
): Resultado {
  const sf = criarSourceFile(source, file);
  const placar = new Placar();
  const ctx: Contexto = { file, placar };
  const edicoes: Edicao[] = [];
  let reviews = 0;

  const tratar = (no: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression) => {
    if (posicaoProibida(no)) return;
    const partes = pedacos(no, sf);
    const listas = partes.map((p) => new Lista(p.texto, p.parcialInicio, p.parcialFim));
    const ehClasse =
      !partes.some((p) => p.texto.includes("\\")) &&
      (emContextoDeClasse(no) || pareceListaDeClasses(listas.flatMap((l) => l.tokens)));
    const motivos: string[] = [];
    if (ehClasse) {
      listas.forEach((lista, i) => {
        processar(lista, ctx);
        for (const t of lista.tokens) if (t.revisao) motivos.push(`${t.raw} → ${t.revisao.motivo}`);
        if (lista.mudou) edicoes.push({ inicio: partes[i].inicio, fim: partes[i].fim, texto: lista.render() });
      });
    } else if (revisarTexto) {
      for (const p of partes) motivos.push(...revisarTexto(p.texto, no, ctx));
    }
    if (motivos.length && !JA_MARCADO.test(source.slice(no.end))) {
      edicoes.push({ inicio: no.end, fim: no.end, texto: marcador(motivos) });
      reviews++;
    }
  };

  const visitar = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return tratar(n);
    if (ts.isTemplateExpression(n)) {
      tratar(n);
      for (const s of n.templateSpans) visitar(s.expression);
      return;
    }
    ts.forEachChild(n, visitar);
  };
  visitar(sf);

  return { code: aplicarEdicoes(source, edicoes), reviews, replacements: placar.trocas, porRegra: placar.porRegra };
}
