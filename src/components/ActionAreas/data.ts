import homeSubjectArte from "../../assets/icons/home-subjects-arte.svg";
import homeSubjectAtualidades from "../../assets/icons/home-subjects-atualidades.svg";
import homeSubjectBiologia from "../../assets/icons/home-subjects-biologia.svg";
import homeSubjectEspanhol from "../../assets/icons/home-subjects-espanhol.svg";
import homeSubjectFilosofia from "../../assets/icons/home-subjects-filosofia.svg";
import homeSubjectFisica from "../../assets/icons/home-subjects-fisica.svg";
import homeSubjectGeografia from "../../assets/icons/home-subjects-geografia.svg";
import homeSubjectGramatica from "../../assets/icons/home-subjects-gramatica.svg";
import homeSubjectHistoria from "../../assets/icons/home-subjects-historia.svg";
import homeSubjectIngles from "../../assets/icons/home-subjects-ingles.svg";
import homeSubjectLeituraProdTextos from "../../assets/icons/home-subjects-leitura-prod-textos.svg";
import homeSubjectLiteratura from "../../assets/icons/home-subjects-literatura.svg";
import homeSubjectMatematica from "../../assets/icons/home-subjects-matematica.svg";
import homeSubjectQuimica from "../../assets/icons/home-subjects-quimica.svg";
import homeSubjectSociologia from "../../assets/icons/home-subjects-sociologia.svg";
import { ActionAreas } from "./types.ts";


export const actionAreas : ActionAreas = {
    title: "Veja nossas áreas de ação",
    subtitle: "Disciplinas divididas de forma a facilitar o estudo para o ENEM",
    tabItems: ["Linguagens", "Ciências da natureza e matemática", "Ciências humanas"],
    cardItems: [
        {
            id: 0,
            items: [
                {
                    id: 1,
                    image: homeSubjectLeituraProdTextos,
                    title: "Leitura e Produção de Textos",
                    subtitle: "",
                },
                {
                    id: 2,
                    image: homeSubjectGramatica,
                    title: "Gramática",
                    subtitle: "",
                },
                {
                    id: 3,
                    image: homeSubjectLiteratura,
                    title: "Literatura",
                    subtitle: "",
                },
                {
                    id: 4,
                    image: homeSubjectIngles,
                    title: "Inglês",
                    subtitle: "",
                },
                {
                    id: 5,
                    image: homeSubjectEspanhol,
                    title: "Espanhol",
                    subtitle: "",
                },
                {
                    id: 6,
                    image: homeSubjectArte,
                    title: "Artes",
                    subtitle: "",
                },
            ],
        },
        {
            id: 1,
            items: [
                {
                    id: 7,
                    image: homeSubjectBiologia,
                    title: "Biologia",
                    subtitle: "",
                },
                {
                    id: 8,
                    image: homeSubjectFisica,
                    title: "Física",
                    subtitle: "",
                },
                {
                    id: 9,
                    image: homeSubjectQuimica,
                    title: "Química",
                    subtitle: "",
                },
                {
                    id: 10,
                    image: homeSubjectMatematica,
                    title: "Matemática",
                    subtitle: "",
                },
            ],
        },
        {
            id: 2,
            items: [
                {
                    id: 11,
                    image: homeSubjectSociologia,
                    title: "Sociologia",
                    subtitle: "",
                },
                {
                    id: 12,
                    image: homeSubjectFilosofia,
                    title: "Filosofia",
                    subtitle: "",
                },
                {
                    id: 13,
                    image: homeSubjectHistoria,
                    title: "História",
                    subtitle: "",
                },
                {
                    id: 14,
                    image: homeSubjectGeografia,
                    title: "Geografia",
                    subtitle: "",
                },
                {
                    id: 15,
                    image: homeSubjectAtualidades,
                    title: "Atualidades",
                    subtitle: "",
                },
            ],
        },
    ],
};