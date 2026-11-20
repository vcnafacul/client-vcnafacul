// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { palette } from "../lib/palette";

const css = readFileSync("src/styles/tokens.css", "utf-8");
const semComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");

type Tokens = Record<string, string>;

function bloco(seletor: string): Tokens {
  const saida: Tokens = {};
  const re = new RegExp(
    `${seletor.replace(/[[\]"]/g, "\\$&")}\\s*\\{([^}]*)\\}`,
    "g",
  );
  for (const m of semComentarios.matchAll(re)) {
    for (const d of m[1].matchAll(/--([\w-]+):\s*([^;]+);/g))
      saida[d[1]] = d[2].trim();
  }
  return saida;
}

const raiz = bloco(":root");
const temas = ["marine", "neutral", "yellow"];
const porTema: Record<string, Tokens> = Object.fromEntries(
  temas.map((t) => [t, { ...raiz, ...bloco(`[data-theme="${t}"]`) }]),
);

function hslParaRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round) as [
    number,
    number,
    number,
  ];
}

function resolve(tokens: Tokens, nome: string): [number, number, number] {
  let v = tokens[nome];
  if (v === undefined) throw new Error(`token --${nome} não existe`);
  for (let i = 0; i < 10; i++) {
    const m = v.match(/^var\(--([\w-]+)\)$/);
    if (!m) break;
    v = tokens[m[1]];
    if (v === undefined) throw new Error(`var() quebrada em --${nome}`);
  }
  const c = v.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!c) throw new Error(`--${nome} não resolve para H S% L%: ${v}`);
  return hslParaRgb(Number(c[1]), Number(c[2]), Number(c[3]));
}

function luminancia([r, g, b]: [number, number, number]) {
  const [R, G, B] = [r, g, b].map((x) => {
    const c = x / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contraste(t: Tokens, a: string, b: string) {
  const [l1, l2] = [luminancia(resolve(t, a)), luminancia(resolve(t, b))].sort(
    (x, y) => y - x,
  );
  return (l1 + 0.05) / (l2 + 0.05);
}

const superficies = ["background", "page", "card", "muted"];
const pares: [string, string, number][] = [];
for (const x of [
  "card",
  "popover",
  "primary",
  "secondary",
  "muted",
  "accent",
  "cta",
  "destructive",
  "success",
  "warning",
  "info",
  "sidebar-primary",
  "sidebar-accent",
]) {
  pares.push([`${x}-foreground`, x, 4.5]);
}
pares.push(
  ["foreground", "background", 4.5],
  ["sidebar-foreground", "sidebar-background", 4.5],
);
for (const t of [
  "foreground",
  "muted-foreground",
  "destructive",
  "success",
  "warning",
  "info",
  "highlight",
]) {
  for (const s of superficies) if (t !== s) pares.push([t, s, 4.5]);
}
for (const t of ["destructive", "success", "warning", "info"])
  pares.push([t, `${t}-muted`, 4.5]);
pares.push(["input", "background", 3], ["ring", "background", 3]);
for (let i = 1; i <= 6; i++) pares.push([`chart-${i}`, "background", 3]);

// Pares que hoje ficam abaixo do mínimo, um a um, com a razão medida. Nada é excluído por padrão:
// par fora desta lista que falhe derruba o teste, e par listado que passe a cumprir também ("remova a exceção").
const EXCECOES: [
  tema: string,
  a: string,
  b: string,
  razao: number,
  motivo: string,
][] = [
  [
    "root",
    "highlight",
    "muted",
    4.48,
    "orange-700 sobre neutral-100; decidir token (Task 2)",
  ],
  [
    "marine",
    "foreground",
    "page",
    1.06,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "muted-foreground",
    "page",
    1.26,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "destructive",
    "background",
    2.46,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "destructive",
    "card",
    1.89,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "destructive",
    "muted",
    1.89,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "success",
    "background",
    2.03,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "success",
    "card",
    1.56,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "success",
    "muted",
    1.56,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "warning",
    "background",
    2.79,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "warning",
    "card",
    2.15,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "warning",
    "muted",
    2.15,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "info",
    "background",
    2.7,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "info",
    "card",
    2.08,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "info",
    "muted",
    2.08,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "highlight",
    "page",
    1.73,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "chart-1",
    "background",
    1.79,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "marine",
    "chart-4",
    "background",
    2.98,
    "seção escura: token de status/gráfico/page não é usado nela",
  ],
  [
    "neutral",
    "highlight",
    "muted",
    4.48,
    "orange-700 sobre neutral-100; decidir token (Task 2)",
  ],
  [
    "yellow",
    "input",
    "background",
    2.99,
    "borda de campo ligeiramente abaixo de 3:1 sobre yellow-50; decidir token (Task 2)",
  ],
];

const chave = (t: string, a: string, b: string) => `${t}|${a}|${b}`;

describe("contraste WCAG 2.x (tokens.css)", () => {
  it("--cta-foreground é branco em :root", () => {
    expect(resolve(raiz, "cta-foreground")).toEqual([255, 255, 255]);
  });

  it("não há exceção duplicada nem de par inexistente", () => {
    const todas = EXCECOES.map(([t, a, b]) => chave(t, a, b));
    expect(new Set(todas).size).toBe(todas.length);
    for (const [t, a, b] of EXCECOES) {
      expect(
        pares.some(([x, y]) => x === a && y === b),
        `${t}: ${a} sobre ${b} não é um par testado`,
      ).toBe(true);
    }
  });

  for (const [tema, tokens] of [
    ["root", raiz] as const,
    ...Object.entries(porTema),
  ]) {
    describe(tema === "root" ? ":root" : `[data-theme="${tema}"]`, () => {
      it.each(pares)("%s sobre %s >= %s:1", (a, b, min) => {
        const r = contraste(tokens, a, b);
        const ex = EXCECOES.find(
          ([t, x, y]) => t === tema && x === a && y === b,
        );
        if (!ex) return expect(r).toBeGreaterThanOrEqual(min);
        expect(
          r,
          `exceção de ${tema}: ${a} sobre ${b} agora cumpre ${min}:1, remova a exceção`,
        ).toBeLessThan(min);
        expect(r.toFixed(2), `razão de ${a} sobre ${b} em ${tema} mudou`).toBe(
          ex[3].toFixed(2),
        );
      });
    });
  }
});

describe("palette.ts espelha os primitivos do CSS", () => {
  const primitivos = [
    ...css.matchAll(
      /--([a-z]+)-(\d+):\s*(\d+) (\d+)% (\d+)%;\s*\/\*\s*(#[0-9A-Fa-f]{6})/g,
    ),
  ];

  it("há primitivos", () => expect(primitivos.length).toBeGreaterThan(50));

  it("mesmo conjunto de matizes e passos", () => {
    const css = primitivos.map((m) => `${m[1]}-${m[2]}`).sort();
    const ts = Object.entries(palette)
      .flatMap(([h, s]) => Object.keys(s).map((k) => `${h}-${k}`))
      .sort();
    expect(ts).toEqual(css);
  });

  it.each(primitivos.map((m) => [`${m[1]}-${m[2]}`, m] as const))(
    "%s",
    (_, m) => {
      const ts = (palette as Record<string, Record<string, string>>)[m[1]][
        m[2]
      ];
      expect(ts.toUpperCase()).toBe(m[6].toUpperCase());
      const calc = hslParaRgb(Number(m[3]), Number(m[4]), Number(m[5]));
      const alvo = [1, 3, 5].map((i) => parseInt(ts.slice(i, i + 2), 16));
      // o HSL do CSS é inteiro, então o RGB recalculado difere do hex em até 3 por canal
      calc.forEach((c, i) =>
        expect(Math.abs(c - alvo[i])).toBeLessThanOrEqual(3),
      );
    },
  );
});
