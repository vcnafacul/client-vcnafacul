// Varredura de ícones (tickets/059 §7.3, Icons): react-icons/fi e /lu, Heroicons e Radix viram o
// ícone do lucide-react de mesmo nome (conferido na lista de exports instalada); o resto é revisão.
import * as lucide from "lucide-react";
import ts from "typescript";
import { JA_MARCADO, Placar, type Resultado, aplicarEdicoes, criarSourceFile, marcador } from "./core";

export const LUCIDE = new Set(Object.keys(lucide).filter((n) => /^[A-Z]/.test(n) && n !== "Icon"));

// Heroicons e Radix com nome diferente no lucide (sem o sufixo Icon)
const HEROICONS: Record<string, string> = {
  AcademicCap: "GraduationCap",
  AdjustmentsHorizontal: "SlidersHorizontal",
  ArrowDownTray: "Download",
  ArrowLeftOnRectangle: "LogIn",
  ArrowPath: "RefreshCw",
  ArrowRightOnRectangle: "LogOut",
  ArrowRightStartOnRectangle: "LogOut",
  ArrowTopRightOnSquare: "ExternalLink",
  ArrowUpTray: "Upload",
  Bars3: "Menu",
  ChartBar: "ChartColumn",
  ChatBubbleLeft: "MessageSquare",
  CheckCircle: "CircleCheck",
  ChevronUpDown: "ChevronsUpDown",
  ClipboardDocument: "Clipboard",
  ClipboardDocumentCheck: "ClipboardCheck",
  CloudArrowUp: "CloudUpload",
  Cog: "Settings",
  Cog6Tooth: "Settings",
  Cog8Tooth: "Settings",
  Document: "File",
  DocumentDuplicate: "Copy",
  DocumentText: "FileText",
  EllipsisHorizontal: "Ellipsis",
  Envelope: "Mail",
  ExclamationCircle: "CircleAlert",
  ExclamationTriangle: "TriangleAlert",
  EyeSlash: "EyeOff",
  Home: "House",
  InformationCircle: "Info",
  LockClosed: "Lock",
  LockOpen: "LockOpen",
  MagnifyingGlass: "Search",
  MinusCircle: "CircleMinus",
  PencilSquare: "SquarePen",
  Photo: "Image",
  PlusCircle: "CirclePlus",
  QuestionMarkCircle: "CircleHelp",
  TableCells: "Table",
  UserGroup: "Users",
  XCircle: "CircleX",
  XMark: "X",
};
const RADIX: Record<string, string> = {
  CaretDown: "ChevronDown",
  CaretLeft: "ChevronLeft",
  CaretRight: "ChevronRight",
  CaretSort: "ChevronsUpDown",
  CaretUp: "ChevronUp",
  CheckCircled: "CircleCheck",
  Cross1: "X",
  Cross2: "X",
  CrossCircled: "CircleX",
  DotFilled: "Dot",
  DotsHorizontal: "Ellipsis",
  DotsVertical: "EllipsisVertical",
  DragHandleDots2: "GripVertical",
  Enter: "LogIn",
  Exit: "LogOut",
  ExclamationTriangle: "TriangleAlert",
  EyeClosed: "EyeOff",
  EyeOpen: "Eye",
  Gear: "Settings",
  HamburgerMenu: "Menu",
  Home: "House",
  InfoCircled: "Info",
  LockClosed: "Lock",
  LockOpen1: "LockOpen",
  MagnifyingGlass: "Search",
  MinusCircled: "CircleMinus",
  Pencil1: "Pencil",
  Pencil2: "SquarePen",
  Person: "User",
  PlusCircled: "CirclePlus",
  QuestionMarkCircled: "CircleHelp",
  Reload: "RotateCw",
  Trash: "Trash2",
};

type Origem = "react-icons" | "heroicons" | "radix";

function origemDe(pacote: string): Origem | "outro-react-icons" | null {
  if (pacote === "react-icons/fi" || pacote === "react-icons/lu") return "react-icons";
  if (pacote === "react-icons" || pacote.startsWith("react-icons/")) return "outro-react-icons";
  if (pacote === "@heroicons/react" || pacote.startsWith("@heroicons/react/")) return "heroicons";
  if (pacote === "@radix-ui/react-icons") return "radix";
  return null;
}

export function nomeLucide(pacote: string, nome: string): string | null {
  let alvo: string;
  if (pacote === "react-icons/fi") alvo = nome.replace(/^Fi/, "");
  else if (pacote === "react-icons/lu") alvo = nome.replace(/^Lu/, "");
  else if (origemDe(pacote) === "heroicons") {
    const base = nome.replace(/Icon$/, "");
    alvo = HEROICONS[base] ?? base;
  } else if (origemDe(pacote) === "radix") {
    const base = nome.replace(/Icon$/, "");
    alvo = RADIX[base] ?? base;
  } else return null;
  return LUCIDE.has(alvo) ? alvo : null;
}

const PASSOS = new Set(["3", "3.5", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "16"]);

/** size em px → "h-N w-N" (16 → h-4 w-4, 20 → h-5 w-5), quando há passo na escala. */
export function classesDoTamanho(px: number): string | null {
  const passo = String(px / 4);
  return PASSOS.has(passo) ? `h-${passo} w-${passo}` : null;
}

const TEM_TAMANHO = /(?:^|[\s"'`])(?:[\w-]+:)*(?:h|w|size)-/;

type Edicao = { inicio: number; fim: number; texto: string };

export function transform(source: string, file: string): Resultado {
  const sf = criarSourceFile(source, file);
  const placar = new Placar();
  const edicoes: Edicao[] = [];
  let reviews = 0;

  const imports = sf.statements.filter(
    (s): s is ts.ImportDeclaration =>
      ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && origemDe(s.moduleSpecifier.text) !== null,
  );
  if (!imports.length) return { code: source, reviews: 0, replacements: 0, porRegra: {} };

  const lucideExistente = sf.statements.find(
    (s): s is ts.ImportDeclaration =>
      ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && s.moduleSpecifier.text === "lucide-react",
  );
  const especificadoresLucide: string[] = [];
  const jaNoLucide = new Set<string>();
  const ligadosNoLucide = lucideExistente?.importClause?.namedBindings;
  if (ligadosNoLucide && ts.isNamedImports(ligadosNoLucide))
    for (const e of ligadosNoLucide.elements) jaNoLucide.add(e.getText(sf));

  // nomes em uso no arquivo, fora dos imports de ícone: um alvo que colide ganha o sufixo Icon (XIcon)
  const nomesNoArquivo = new Set<string>();
  const coletar = (n: ts.Node) => {
    if (imports.includes(n as ts.ImportDeclaration)) return;
    if (ts.isIdentifier(n)) nomesNoArquivo.add(n.text);
    ts.forEachChild(n, coletar);
  };
  coletar(sf);

  const renomear = new Map<string, string>(); // local antigo → local novo
  const locaisMapeados = new Set<string>(); // locais (já renomeados) que agora são lucide
  const deReactIcons = new Set<string>();
  const marcadoresPorImport = new Map<ts.ImportDeclaration, string[]>();
  const restos = new Map<ts.ImportDeclaration, string[]>();

  for (const decl of imports) {
    const pacote = (decl.moduleSpecifier as ts.StringLiteral).text;
    const origem = origemDe(pacote)!;
    const motivos: string[] = [];
    marcadoresPorImport.set(decl, motivos);
    const clausula = decl.importClause;
    const nomeados = clausula?.namedBindings && ts.isNamedImports(clausula.namedBindings) ? clausula.namedBindings : null;
    if (origem === "outro-react-icons") {
      const nomes = nomeados?.elements.map((e) => e.getText(sf)).join(", ") ?? "";
      motivos.push(
        pacote === "react-icons"
          ? `${nomes} → LucideIcon do lucide-react`
          : `${pacote} (${nomes}) → equivalente no lucide ou SVG local para marcas`,
      );
      placar.revisao("icone-outro-pacote");
      continue;
    }
    if (!nomeados || clausula?.name || clausula?.isTypeOnly) {
      motivos.push(`import de ${pacote} sem nomes → lucide-react`);
      placar.revisao("icone-sem-equivalente");
      continue;
    }
    const sobram: string[] = [];
    for (const e of nomeados.elements) {
      const importado = (e.propertyName ?? e.name).text;
      const local = e.name.text;
      const alvo = e.isTypeOnly ? null : nomeLucide(pacote, importado);
      if (!alvo) {
        sobram.push(e.getText(sf));
        motivos.push(`${importado} sem equivalente de mesmo nome no lucide`);
        placar.revisao("icone-sem-equivalente");
        continue;
      }
      let espec: string;
      let novoLocal: string;
      if (local !== importado) {
        espec = `${alvo} as ${local}`;
        novoLocal = local;
      } else {
        const livre = !nomesNoArquivo.has(alvo) || [...renomear.values()].includes(alvo);
        novoLocal = livre ? alvo : `${alvo}Icon`;
        if (!LUCIDE.has(novoLocal)) novoLocal = `${alvo}Icone`;
        espec = novoLocal === `${alvo}Icone` ? `${alvo} as ${novoLocal}` : novoLocal;
        renomear.set(local, novoLocal);
      }
      locaisMapeados.add(novoLocal);
      if (origem === "react-icons") deReactIcons.add(novoLocal);
      if (!jaNoLucide.has(espec) && !especificadoresLucide.includes(espec)) especificadoresLucide.push(espec);
      placar.troca("icone");
    }
    restos.set(decl, sobram);
  }

  // referências: renomeia e, no JSX, troca size por classes
  const usadoComoValor = new Set<string>();
  const visitar = (n: ts.Node) => {
    if (imports.includes(n as ts.ImportDeclaration)) return;
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) ajustarTamanho(n);
    if (ts.isIdentifier(n) && renomear.has(n.text)) {
      const p = n.parent;
      const ehNomeDePropriedade =
        (ts.isPropertyAccessExpression(p) && p.name === n) ||
        (ts.isPropertyAssignment(p) && p.name === n) ||
        ts.isJsxAttribute(p) ||
        (ts.isQualifiedName(p) && p.right === n);
      if (!ehNomeDePropriedade) {
        const novo = renomear.get(n.text)!;
        const texto = ts.isShorthandPropertyAssignment(p) ? `${n.text}: ${novo}` : novo;
        edicoes.push({ inicio: n.getStart(sf), fim: n.end, texto });
        const emTag = (ts.isJsxOpeningElement(p) || ts.isJsxSelfClosingElement(p) || ts.isJsxClosingElement(p)) && p.tagName === n;
        if (!emTag && !ts.isTypeQueryNode(p)) usadoComoValor.add(novo);
      }
    }
    ts.forEachChild(n, visitar);
  };

  function ajustarTamanho(el: ts.JsxOpeningElement | ts.JsxSelfClosingElement) {
    if (!ts.isIdentifier(el.tagName)) return;
    const local = renomear.get(el.tagName.text) ?? el.tagName.text;
    if (!locaisMapeados.has(local)) return;
    const attrs = el.attributes.properties.filter(ts.isJsxAttribute);
    const tamanho = attrs.find((a) => a.name.getText(sf) === "size");
    const classe = attrs.find((a) => a.name.getText(sf) === "className");
    const literalDe = (a?: ts.JsxAttribute) => {
      const ini = a?.initializer;
      if (!ini) return undefined;
      if (ts.isStringLiteral(ini)) return ini;
      if (ts.isJsxExpression(ini) && ini.expression && (ts.isStringLiteral(ini.expression) || ts.isNoSubstitutionTemplateLiteral(ini.expression)))
        return ini.expression;
      return undefined;
    };
    const classeLiteral = literalDe(classe);
    const classeTexto = classe?.initializer?.getText(sf) ?? "";
    const temClasseDeTamanho = TEM_TAMANHO.test(classeTexto.replace(/^[{"'`]+/, " "));

    if (tamanho) {
      const ini = tamanho.initializer;
      const lit =
        ini && ts.isJsxExpression(ini) && ini.expression && ts.isNumericLiteral(ini.expression)
          ? Number(ini.expression.text)
          : ini && (ts.isStringLiteral(ini) || (ts.isJsxExpression(ini) && ini.expression && ts.isStringLiteral(ini.expression)))
            ? Number((ts.isStringLiteral(ini) ? ini : (ini.expression as ts.StringLiteral)).text)
            : NaN;
      const classes = Number.isFinite(lit) ? classesDoTamanho(lit) : null;
      if (!classes) return; // size dinâmico ou fora da escala: o lucide aceita a prop size
      if (temClasseDeTamanho) {
        edicoes.push({ inicio: tamanho.pos, fim: tamanho.end, texto: "" });
      } else if (classeLiteral) {
        edicoes.push({ inicio: tamanho.pos, fim: tamanho.end, texto: "" });
        const ini2 = classeLiteral.getStart(sf) + 1;
        edicoes.push({ inicio: ini2, fim: ini2, texto: classeLiteral.text.trim() ? `${classes} ` : classes });
      } else if (!classe) {
        edicoes.push({ inicio: tamanho.pos, fim: tamanho.end, texto: ` className="${classes}"` });
      } else return; // className dinâmico: mantém size
      placar.troca("icone-tamanho");
      return;
    }
    // react-icons tem 1em por padrão; o lucide, 24px
    if (deReactIcons.has(local) && !temClasseDeTamanho) {
      edicoes.push({ inicio: el.tagName.end, fim: el.tagName.end, texto: ` size="1em"` });
      placar.troca("icone-tamanho");
    }
  }
  visitar(sf);

  // o marcador de ícone usado como valor fica no import do lucide
  const motivosLucide: string[] = [];
  for (const local of usadoComoValor) {
    if (!deReactIcons.has(local)) continue;
    motivosLucide.push(`${local} usado como valor: lucide tem 24px por padrão (react-icons, 1em); confira o tamanho onde é renderizado`);
    placar.revisao("icone-como-valor");
  }

  // imports: o primeiro import de ícone dá lugar ao do lucide (se ainda não houver um)
  let inseriuLucide = false;
  for (const decl of imports) {
    const sobram = restos.get(decl);
    const motivos = marcadoresPorImport.get(decl)!;
    const marca = motivos.length && !JA_MARCADO.test(source.slice(decl.end)) ? marcador(motivos) : "";
    if (marca) reviews++;
    let texto: string;
    if (sobram === undefined) texto = decl.getText(sf); // pacote inteiro em revisão
    else if (sobram.length) texto = `import { ${sobram.join(", ")} } from ${(decl.moduleSpecifier as ts.StringLiteral).getText(sf)};`;
    else texto = "";
    if (!inseriuLucide && !lucideExistente && especificadoresLucide.length) {
      const doLucide = `import { ${especificadoresLucide.join(", ")} } from "lucide-react";`;
      texto = [texto + marca, doLucide + (motivosLucide.length ? marcador(motivosLucide) : "")].filter(Boolean).join("\n");
      if (motivosLucide.length) reviews++;
      inseriuLucide = true;
      edicoes.push({ inicio: decl.getStart(sf), fim: decl.end, texto });
      continue;
    }
    if (!texto && !marca) {
      // remove o import e a quebra de linha que o segue
      const fim = source[decl.end] === "\n" ? decl.end + 1 : decl.end;
      edicoes.push({ inicio: decl.getStart(sf), fim, texto: "" });
    } else if (texto !== decl.getText(sf) || marca) {
      edicoes.push({ inicio: decl.getStart(sf), fim: decl.end, texto: texto + marca });
    }
  }
  if (lucideExistente && especificadoresLucide.length && ligadosNoLucide && ts.isNamedImports(ligadosNoLucide)) {
    const todos = [...ligadosNoLucide.elements.map((e) => e.getText(sf)), ...especificadoresLucide];
    edicoes.push({ inicio: ligadosNoLucide.getStart(sf), fim: ligadosNoLucide.end, texto: `{ ${todos.join(", ")} }` });
  }
  if (lucideExistente && motivosLucide.length && !JA_MARCADO.test(source.slice(lucideExistente.end))) {
    edicoes.push({ inicio: lucideExistente.end, fim: lucideExistente.end, texto: marcador(motivosLucide) });
    reviews++;
  }

  return { code: aplicarEdicoes(source, edicoes), reviews, replacements: placar.trocas, porRegra: placar.porRegra };
}
