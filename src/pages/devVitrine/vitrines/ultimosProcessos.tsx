import { UltimosProcessos } from "@/pages/analytics/UltimosProcessos";
import { UltimoProcesso } from "@/services/analytics/monitoramento";
import { Vitrine } from "../tipos";

/** A tabela dos últimos processos (tickets/044, card 08). */
const base = (i: number, over: Partial<UltimoProcesso> = {}): UltimoProcesso => ({
  id: `p${i}`,
  nome: `Processo seletivo ${2026 - Math.floor(i / 3)} – turma ${(i % 3) + 1}`,
  cursinho: { id: `c${i % 4}`, nome: ["Cursinho Alfa", "Educafro Brás", "Pré-Vestibular São José", "Cursinho Popular Zona Leste"][i % 4] },
  inicio: `2026-${String(10 - i).padStart(2, "0")}-01T00:00:00.000Z`,
  fim: `2026-${String(10 - i).padStart(2, "0")}-28T00:00:00.000Z`,
  situacao: i === 0 ? "futuro" : i === 1 ? "aberto" : "encerrado",
  inscricoes: 300 - i * 27,
  matriculas: 90 - i * 8,
  ...over,
});
const dez = Array.from({ length: 10 }, (_, i) => base(i));
const longos = dez.slice(0, 4).map((p, i) =>
  i % 2
    ? { ...p, nome: "Processo seletivo de bolsas integrais para o segundo semestre letivo com aulas aos sábados" }
    : { ...p, cursinho: { id: "x", nome: "Pré-Vestibular Comunitário São José dos Campos – Unidade Centro Histórico" } },
);

export const vitrineUltimosProcessos: Vitrine = {
  slug: "tabela-ultimos-processos",
  titulo: "Últimos processos seletivos",
  arquivo: "src/pages/analytics/UltimosProcessos.tsx",
  estados: [
    { slug: "global", titulo: "Plataforma", render: () => <UltimosProcessos processos={dez} carregando={false} mostrarCursinho /> },
    { slug: "cursinho", titulo: "Cursinho", render: () => <UltimosProcessos processos={dez.slice(0, 6)} carregando={false} mostrarCursinho={false} /> },
    { slug: "vazio", titulo: "Vazio", render: () => <UltimosProcessos processos={[]} carregando={false} mostrarCursinho /> },
    { slug: "carregando", titulo: "Carregando", render: () => <UltimosProcessos processos={[]} carregando mostrarCursinho /> },
    { slug: "nome-longo", titulo: "Nomes longos", render: () => <UltimosProcessos processos={longos} carregando={false} mostrarCursinho /> },
  ],
};
