import { ModalQuestionDetailsRefactored } from "@/pages/dashQuestionNew/modals/ModalQuestionDetailsRefactored";
import { Vitrine } from "../tipos";

/**
 * O modal da questão com o conteúdo que não pode ser salvo: questão antiga com
 * alternativas vazias (estavam em imagem). Clicar em "Editar Conteúdo" e trocar
 * de aba: a faixa do topo lista o que impede salvar, com "Ir até o campo".
 */
const questao = {
  _id: "q-vitrine",
  textoQuestao: "Uma questão antiga cujo enunciado está completo.",
  pergunta: "",
  textoAlternativaA: "",
  textoAlternativaB: "",
  textoAlternativaC: "Alternativa C com texto",
  textoAlternativaD: "Alternativa D com texto",
  textoAlternativaE: "Alternativa E com texto",
  alternativa: "C",
  status: 0,
  provasContendo: [],
};

const rotas = [
  { caminho: /\/questoes\/q-vitrine$/, resposta: { corpo: questao } },
];

const modal = (abaInicial: string) => (
  <ModalQuestionDetailsRefactored
    isOpen
    onClose={() => {}}
    questionId="q-vitrine"
    infos={{ provas: [], materias: [], frentes: [], enemAreas: [] }}
    abaInicial={abaInicial}
  />
);

export const vitrinePendenciasDaQuestao: Vitrine = {
  slug: "pendencias-da-questao",
  titulo: "Questão com conteúdo que não salva",
  arquivo:
    "src/pages/dashQuestionNew/modals/tabs/TabConteudo/PendenciasDoConteudo.tsx",
  estados: [
    {
      slug: "enunciado",
      titulo: "Aba Enunciado",
      rotas,
      render: () => modal("conteudo"),
    },
    {
      slug: "classificacao",
      titulo: "Aba Classificação",
      rotas,
      render: () => modal("classificacao"),
    },
  ],
};
