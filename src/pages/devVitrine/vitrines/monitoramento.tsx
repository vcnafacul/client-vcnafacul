import { Vitrine } from "../tipos";
import { MonitoramentoCabecalhoDemo as Cabecalho } from "./MonitoramentoCabecalhoDemo";

/** O cabeçalho do Monitoramento com o seletor de cursinho (tickets/044, card 06). */
const poucos = [
  { id: "a", name: "Cursinho Alfa" },
  { id: "b", name: "Pré-Vestibular Comunitário São José dos Campos – Unidade Centro" },
  { id: "c", name: "Educafro Brás" },
];
const muitos = Array.from({ length: 40 }, (_, i) => ({
  id: `c${i}`,
  name: `Cursinho Popular ${String(i + 1).padStart(2, "0")}`,
}));

export const vitrineMonitoramentoCabecalho: Vitrine = {
  slug: "monitoramento-cabecalho",
  titulo: "Monitoramento – cabeçalho",
  arquivo: "src/pages/analytics/CabecalhoDoMonitoramento.tsx",
  estados: [
    { slug: "todos", titulo: "Todos", render: () => <Cabecalho cursinhos={poucos} inicial={null} /> },
    { slug: "cursinho", titulo: "Cursinho (nome longo)", render: () => <Cabecalho cursinhos={poucos} inicial="b" /> },
    { slug: "lista-longa", titulo: "Lista longa", render: () => <Cabecalho cursinhos={muitos} inicial={null} /> },
  ],
};
