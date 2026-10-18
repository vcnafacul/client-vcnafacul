import { MotivoAnulacao } from "@/dtos/question/anulacao";
import { TabClassificacao } from "@/pages/dashQuestionNew/modals/tabs/TabClassificacao";
import { Vitrine } from "../tipos";

/**
 * A aba Classificação do modal da questão (tickets/042, card 21): aviso único
 * no topo, ações da anulação no título "Prova" (no modo edição, o "Remover da
 * prova" no mesmo lugar) e "Cancelar" no lugar do "Editar Classificação".
 */
const provas = [
  { provaId: "pa", provaNome: "Simulado 3 – Cursinho X", numero: 45, podeComporProva: true },
  { provaId: "pb", provaNome: "ENEM 2022 – Dia 2", numero: 12, podeComporProva: true },
];
const questao = (anulada: boolean) =>
  ({
    _id: "q1",
    enemArea: "Matemática",
    materia: "m1",
    frente1: "f1",
    status: 0,
    provasContendo: provas,
    provaBase: "pa",
    anulacoes: anulada
      ? [
          {
            provaId: "pa",
            numero: 45,
            motivo: MotivoAnulacao.semAlternativaCorreta,
            justificativa: "A alternativa C, dada como gabarito, está errada.",
            em: "2026-10-16T12:00:00Z",
          },
          {
            provaId: "pb",
            numero: 12,
            motivo: MotivoAnulacao.enunciadoComErro,
            justificativa: "O enunciado cita um gráfico que não foi impresso.",
            em: "2026-10-17T12:00:00Z",
          },
        ]
      : [],
  }) as never;
const infos = {
  provas: provas.map((p) => ({ _id: p.provaId, nome: p.provaNome, podeComporProva: true })),
  enemAreas: [],
  materias: [{ _id: "m1", nome: "Matemática" }],
  frentes: [{ _id: "f1", nome: "Álgebra", materia: "m1" }],
} as never;
const rotas = [{ caminho: /\/missing\//, resposta: { corpo: [7, 8, 45] } }];

export const vitrineAbaClassificacao: Vitrine = {
  slug: "aba-classificacao",
  titulo: "Aba Classificação",
  arquivo: "src/pages/dashQuestionNew/modals/tabs/TabClassificacao/index.tsx",
  estados: [
    {
      slug: "valida",
      titulo: "Questão válida",
      rotas,
      render: () => <TabClassificacao question={questao(false)} infos={infos} canEdit />,
    },
    {
      slug: "anulada",
      titulo: "Anulada em 2 provas",
      rotas,
      render: () => <TabClassificacao question={questao(true)} infos={infos} canEdit />,
    },
    {
      slug: "filtrada",
      titulo: "Banco filtrado pela 2ª prova",
      rotas,
      // Card 22: provaBase é a "pa", mas o banco estava filtrado pela "pb".
      render: () => <TabClassificacao question={questao(true)} infos={infos} canEdit provaEmFoco="pb" />,
    },
  ],
};
