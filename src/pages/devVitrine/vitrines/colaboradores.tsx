import ManagerCollaborator from "@/pages/managerCollaborator";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

/** A tela de colaboradores no Dash V2 (2026-10-19). */
const NOMES = [
  "Ana Lima", "Bruno Souza", "Carla Mendes", "Diego Alves", "Elisa Rocha",
  "Fábio Nunes", "Gabriela Dias", "Hugo Pereira", "Isabela Moreira dos Santos Albuquerque",
  "João Pedro Carvalho",
];
const FUNCOES = ["Professor", "Monitor", "Coordenação", "Secretaria"];

const colaboradores = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `c${i}`,
    photo: "",
    description: "",
    actived: i % 7 !== 3,
    createdAt: new Date(Date.UTC(2024 + (i % 3), i % 12, 1 + (i % 27), 15)).toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: `u${i}`,
      name: `${NOMES[i % NOMES.length]}${i >= NOMES.length ? ` ${i}` : ""}`,
      email: `${NOMES[i % NOMES.length].split(" ")[0].toLowerCase()}${i}@cursinho.org.br`,
      phone: i % 5 === 0 ? "" : `119${String(80000000 + i * 1371).slice(0, 8)}`,
      lastAccess: new Date().toISOString(),
      role: { id: `r${i % 4}`, name: FUNCOES[i % 4] },
    },
  }));

const rotas = (n: number): RotaFalsa[] => [
  {
    caminho: /\/collaborator$/,
    resposta: (url) => {
      const page = Number(url.searchParams.get("page") ?? 1);
      const limit = Number(url.searchParams.get("limit") ?? 100);
      const todos = colaboradores(n);
      return {
        corpo: { data: todos.slice((page - 1) * limit, page * limit), page, limit, totalItems: todos.length },
      };
    },
  },
  { caminho: /\/collaborator\/frentes\/batch$/, resposta: { corpo: {} } },
  { caminho: /\/materia$/, resposta: { corpo: { data: [], page: 1, limit: 100, totalItems: 0 } } },
  { caminho: /\/role\/atribuiveis$/, resposta: { corpo: [] } },
];

export const vitrineColaboradores: Vitrine = {
  slug: "colaboradores",
  titulo: "Colaboradores (Dash V2)",
  arquivo: "src/pages/managerCollaborator/index.tsx",
  estados: [
    { slug: "lista", titulo: "40 colaboradores", rotas: rotas(40), render: () => <ManagerCollaborator /> },
    { slug: "vazia", titulo: "Sem colaboradores", rotas: rotas(0), render: () => <ManagerCollaborator /> },
  ],
};
