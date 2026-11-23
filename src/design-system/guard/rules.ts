import { existsSync } from "node:fs";
import { posix } from "node:path";
import allowList from "./frozen-allowlist.json";

export type GuardRule = {
  id: string;
  description: string;
  match(source: string, file: string): number;
};

const contar = (re: RegExp, s: string) => (s.match(re) ?? []).length;
const dentro = (file: string, ...pastas: string[]) => pastas.some((p) => file.includes(p));

// Utilitários de cor: prefixo + nome, sem letra/hífen antes e depois (text-white e border-border não casam).
const PREFIXO =
  "(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|fill|stroke|from|via|to|outline|divide|decoration|accent|caret|shadow|placeholder)";
const NOMES_LEGADOS =
  "marine|grey|darkGrey|lightGray|gray2|backgroundGrey|backgroundMarine|orange|darkOrange|yellow|lightYellow|pink|green|lightGreen|green2|green3|darkGreen|red|redError|purple|blueGeo|logo\\w*";
const FAMILIAS =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const LEGACY_COLOR = new RegExp(
  `(?<![\\w-])${PREFIXO}-(?:(?:${NOMES_LEGADOS})(?![\\w-])|(?:${FAMILIAS})-\\d{2,3}(?![\\w-])|\\[(?:#|rgb|hsl))`,
  "g",
);

const ESPACO = "(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)";

const IMPORTS_PROIBIDOS = [
  "primereact",
  "@headlessui/react",
  "tailwind-variants",
  "react-icons",
  "@heroicons/react",
  "@radix-ui/react-icons",
  "react-loading-skeleton",
  "react-spinners",
];

function especificadores(source: string): string[] {
  const re = /(?:\bfrom|\bimport|\brequire)\s*\(?\s*["']([^"']+)["']/g;
  return [...source.matchAll(re)].map((m) => m[1]);
}

const KIT_V1 = /^src\/components\/(atoms|molecules|organisms|templates)(\/|$)/;
const EXTENSOES = ["", ".ts", ".tsx", ".css", "/index.ts", "/index.tsx"];

/** Import de um caminho do kit V1 que já foi apagado (o que sobrou na allow-list ainda existe). */
function ehKitV1Apagado(spec: string, file: string): boolean {
  const resolvido = spec.startsWith(".")
    ? posix.join(posix.dirname(file), spec)
    : spec.startsWith("@/")
      ? "src/" + spec.slice(2)
      : "";
  if (!KIT_V1.test(resolvido)) return false;
  return !EXTENSOES.some((e) => (allowList as string[]).includes(resolvido + e));
}

const PASTAS_CONGELADAS = /^src\/components\/(atoms|molecules|organisms|templates)\//;

export const rules: GuardRule[] = [
  {
    id: "legacy-color",
    description: "utilitário de cor legado (marca antiga, família padrão do Tailwind com tom, cor arbitrária)",
    match: (s) => contar(LEGACY_COLOR, s),
  },
  {
    id: "legacy-size",
    description: "tamanho de texto legado (text-xs…9xl, text-[…]) ou font-thin/light/black",
    match: (s) =>
      contar(/(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/g, s) +
      contar(/(?<![\w-])text-\[/g, s) +
      contar(/(?<![\w-])font-(?:thin|light|black)(?![\w-])/g, s),
  },
  {
    id: "arbitrary-spacing",
    description: "espaçamento ou z-index arbitrário (p-[…], gap-[…], z-[…])",
    match: (s) => contar(new RegExp(`(?<![\\w-])-?${ESPACO}-\\[`, "g"), s) + contar(/(?<![\w-])-?z-\[/g, s),
  },
  {
    id: "flagged-elevation",
    description: "shadow-xl/2xl/inner; rounded-2xl/3xl fora de homeV2 e quemSomos",
    match: (s, file) =>
      contar(/(?<![\w-])shadow-(?:xl|2xl|inner)(?![\w-])/g, s) +
      (dentro(file, "src/pages/homeV2", "src/pages/quemSomos")
        ? 0
        : contar(/(?<![\w-])rounded(?:-[a-z]{1,2})?-(?:2xl|3xl)(?![\w-])/g, s)),
  },
  {
    id: "hero-outside-home",
    description: "text-hero fora de src/pages/homeV2",
    match: (s, file) => (dentro(file, "src/pages/homeV2/") ? 0 : contar(/(?<![\w-])text-hero(?![\w-])/g, s)),
  },
  {
    id: "banned-import",
    description: "import de biblioteca banida ou de caminho do kit V1 já apagado (MUI só em arquivo de gráfico)",
    match: (s, file) => {
      const specs = especificadores(s);
      const ehGrafico = specs.some((x) => x.startsWith("@mui/x-charts"));
      return specs.filter((x) => {
        if (x.startsWith("@mui/x-data-grid")) return true;
        if (x === "@mui/material" || x.startsWith("@mui/material/")) return !ehGrafico;
        if (IMPORTS_PROIBIDOS.some((b) => x === b || x.startsWith(b + "/"))) return true;
        return ehKitV1Apagado(x, file);
      }).length;
    },
  },
  {
    id: "frozen-folder",
    description: "arquivo novo em components/{atoms,molecules,organisms,templates}",
    // Varrida pela listagem completa das pastas (qualquer extensão), não só por ts/tsx: ver scan.ts.
    match: (_s, file) =>
      PASTAS_CONGELADAS.test(file) && !(allowList as string[]).includes(file) ? 1 : 0,
  },
  {
    id: "missing-stories",
    description: "componente em components/ui sem .stories.tsx ao lado",
    match: (_s, file) => {
      if (!/^src\/components\/ui\/[^/]+\.tsx$/.test(file) || /\.(stories|test)\.tsx$/.test(file)) return 0;
      return existsSync(file.replace(/\.tsx$/, ".stories.tsx")) ? 0 : 1;
    },
  },
  {
    id: "ds-review-marker",
    description: "marcador /* ds-review */ deixado pelos codemods",
    match: (s) => contar(/\/\* ds-review/g, s),
  },
  {
    id: "toast-import",
    description: "react-toastify só em lib/toast.ts e components/ui/toast.tsx",
    match: (s, file) =>
      dentro(file, "src/lib/toast.ts", "src/components/ui/toast.tsx")
        ? 0
        : especificadores(s).filter((x) => x === "react-toastify" || x.startsWith("react-toastify/")).length,
  },
  {
    id: "ui-semantic-only",
    description: "components/ui usa só utilitários de token semântico",
    match: (s, file) => (dentro(file, "src/components/ui/") ? contar(LEGACY_COLOR, s) : 0),
  },
];
