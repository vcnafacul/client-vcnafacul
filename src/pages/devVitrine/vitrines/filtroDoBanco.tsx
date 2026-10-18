import { QuestionFilters } from "@/pages/dashQuestionNew/components/QuestionFilters";
import { Vitrine } from "../tipos";

/** O filtro do banco de questões (tickets/043, card 03). */
const ENEM = { _id: "enem", nome: "ENEM" };
const FUVEST = { _id: "fuvest", nome: "Fuvest" };
const cat = (id: string, nome: string, exame: typeof ENEM) => ({ _id: id, nome, exame });
const infos = {
  provas: [
    { _id: "p1", nome: "ENEM 2022 – Dia 1", enemAreas: ["Linguagens", "Ciências Humanas"], categoria: cat("c1", "Dia 1", ENEM) },
    { _id: "p2", nome: "ENEM 2022 – Dia 2", enemAreas: ["Matemática", "Ciências da Natureza"], categoria: cat("c2", "Dia 2", ENEM) },
    { _id: "p3", nome: "ENEM 2023 – Dia 1", enemAreas: ["Linguagens"], categoria: cat("c1", "Dia 1", ENEM) },
    { _id: "p4", nome: "Fuvest 2023 – 1ª fase", enemAreas: [], categoria: cat("c3", "1ª fase", FUVEST) },
    { _id: "p5", nome: "Simulado de Outubro – Cursinho Esperança da Zona Leste", enemAreas: ["Matemática"], categoria: cat("c4", "Simulado do cursinho", ENEM) },
  ],
  materias: [{ _id: "m1", nome: "Matemática", enemArea: "Matemática", frentes: [{ _id: "f1", nome: "Álgebra" }] }],
};

export const vitrineFiltroDoBanco: Vitrine = {
  slug: "filtro-do-banco",
  titulo: "Filtro do banco de questões",
  arquivo: "src/pages/dashQuestionNew/components/QuestionFilters.tsx",
  estados: [
    {
      slug: "padrao",
      titulo: "Padrão",
      render: () => <QuestionFilters infos={infos} onFilter={() => {}} />,
    },
  ],
};
