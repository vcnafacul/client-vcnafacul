import plugin from "tailwindcss/plugin";

// Escala de texto do design system (tickets/059 §2.4).
// [tamanhos por breakpoint em px, line-height, peso, extras]
const S = {
  hero: [[48, 48, 72, 96], 1.05, 800, { letterSpacing: "-0.01em", textWrap: "balance" }],
  display: [[30, 48], 1.1, 800, { letterSpacing: "-0.01em" }],
  h1: [[24, 30], 1.2, 700],
  h2: [[20, 24], 1.25, 700],
  h3: [[16, 18], 1.3, 600],
  h4: [[14, 16], 1.4, 600],
  prose: [[16, 17], 1.7, 400],
  body: [[14, 14], 1.5, 400],
  "body-sm": [[13, 13], 1.45, 400],
  caption: [[12, 12], 1.4, 500],
  label: [[13, 13], 1.3, 600],
  button: [[14, 14], 1, 600],
  overline: [[12, 12], 1.3, 700, { textTransform: "uppercase", letterSpacing: "0.16em" }],
  numeric: [[24, 28], 1.1, 700, { fontVariantNumeric: "tabular-nums" }],
};
const BP = ["768px", "1200px", "1565px"];

export default plugin(({ addUtilities }) => {
  for (const [name, [sizes, lh, weight, extra = {}]] of Object.entries(S)) {
    const cls = `.text-${name}`;
    addUtilities({
      [cls]: { fontSize: `${sizes[0]}px`, lineHeight: String(lh), ...extra },
      // Peso com especificidade zero: font-semibold etc. sempre vencem.
      [`:where(${cls})`]: { fontWeight: String(weight) },
      ...Object.fromEntries(
        sizes.slice(1).map((px, i) => [
          `@media (min-width: ${BP[i]})`,
          { [cls]: { fontSize: `${px}px` } },
        ]),
      ),
    });
  }
});
