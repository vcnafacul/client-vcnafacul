import { ReactComponent as HumanasImg } from "../../assets/images/dashboard/humanas.svg";
import { ReactComponent as LinguagensImg } from "../../assets/images/dashboard/linguagens.svg";
import { ReactComponent as MatematicaImg } from "../../assets/images/dashboard/matematica.svg";
import { ReactComponent as NaturezaImg } from "../../assets/images/dashboard/natureza.svg";
import {
  DASH,
  DASH_CONTENT,
  DASH_GEOLOCATION,
  DASH_NEWS,
  DASH_PROVAS,
  DASH_QUESTION,
  DASH_ROLES,
  DASH_SIMULADO,
  ESTUDO,
  NEWS,
  SIMULADO,
} from "../../routes/path";

import { ReactComponent as Espanhol } from "../../assets/icons/home-subjects-espanhol.svg";
import { ReactComponent as Gramatica } from "../../assets/icons/home-subjects-gramatica.svg";
import { ReactComponent as LPT } from "../../assets/icons/home-subjects-leitura-prod-textos.svg";
import { ReactComponent as Literatura } from "../../assets/icons/home-subjects-literatura.svg";

import { ReactComponent as Biologia } from "../../assets/icons/home-subjects-biologia.svg";
import { ReactComponent as Fisica } from "../../assets/icons/home-subjects-fisica.svg";
import { ReactComponent as Matematica } from "../../assets/icons/home-subjects-matematica.svg";
import { ReactComponent as Quimica } from "../../assets/icons/home-subjects-quimica.svg";

import { ReactComponent as Filosofia } from "../../assets/icons/home-subjects-filosofia.svg";
import { ReactComponent as Geografia } from "../../assets/icons/home-subjects-geografia.svg";
import { ReactComponent as Historia } from "../../assets/icons/home-subjects-historia.svg";
import { ReactComponent as Sociologia } from "../../assets/icons/home-subjects-sociologia.svg";

import { ReactComponent as Report } from "../../assets/icons/warning.svg";

import { DashCardMenu } from "../../components/molecules/dashCard";
import { HeaderData } from "../../components/organisms/header";
import { Materias, getMateriaString } from "../../enums/content/materias";
import { Roles } from "../../enums/roles/roles";
import { MateriasLabel } from "../../types/content/materiasLabel";
import { header } from "../home/data";

export const headerDash: HeaderData = {
  ...header,
  pageLinks: [
    {
      Home_Menu_Item_id: {
        id: 1,
        name: "Novidades",
        link: NEWS,
        target: "_self",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 2,
        name: "Simulado",
        link: `${DASH}/${SIMULADO}`,
        target: "_self",
      },
    },
  ],
};

const getMaterialLabel = (value: Materias) => {
  return MateriasLabel.find((m) => m.value === value)?.label || "";
};

export const dashCardMenuItems: DashCardMenu[] = [
  {
    id: 1,
    bg: "bg-marine",
    title: "Linguagens",
    image: LinguagensImg,
    alt: "Linguagens",
    subMenuList: [
      {
        icon: LPT,
        alt: "língua portuguesa",
        text: getMaterialLabel(Materias.LinguaPortuguesa),
        link: `${ESTUDO}/${getMateriaString(Materias.LinguaPortuguesa)}`,
      },
      {
        icon: Gramatica,
        alt: "língua estrangeira",
        text: getMaterialLabel(Materias.LinguaEstrangeira),
        link: `${ESTUDO}/${getMateriaString(Materias.LinguaEstrangeira)}`,
      },
      {
        icon: Literatura,
        alt: "artes",
        text: getMaterialLabel(Materias.Artes),
        link: `${ESTUDO}/${getMateriaString(Materias.Artes)}`,
      },
    ],
  },
  {
    id: 2,
    bg: "bg-pink",
    title: "Natureza",
    image: NaturezaImg,
    alt: "Natureza",
    subMenuList: [
      {
        icon: Biologia,
        alt: "molécula de DNA",
        text: getMaterialLabel(Materias.Biologia),
        link: `${ESTUDO}/${getMateriaString(Materias.Biologia)}`,
      },
      {
        icon: Fisica,
        alt: "risco biológico",
        text: getMaterialLabel(Materias.Fisica),
        link: `${ESTUDO}/${getMateriaString(Materias.Fisica)}`,
      },
      {
        icon: Quimica,
        alt: "quimica",
        text: getMaterialLabel(Materias.Quimica),
        link: `${ESTUDO}/${getMateriaString(Materias.Quimica)}`,
      },
    ],
  },
  {
    id: 3,
    bg: "bg-lightGreen",
    title: "Humanas",
    image: HumanasImg,
    alt: "Humanas",
    subMenuList: [
      {
        icon: Historia,
        alt: "História",
        text: getMaterialLabel(Materias.Historia),
        link: `${ESTUDO}/${getMateriaString(Materias.Historia)}`,
      },
      {
        icon: Geografia,
        alt: "Geografia",
        text: getMaterialLabel(Materias.Geografia),
        link: `${ESTUDO}/${getMateriaString(Materias.Geografia)}`,
      },
      {
        icon: Filosofia,
        alt: "Filosofia",
        text: "Filosofia",
        link: `${ESTUDO}/${getMateriaString(Materias.Filosofia)}`,
      },
      {
        icon: Sociologia,
        alt: "Sociologia",
        text: getMaterialLabel(Materias.Sociologia),
        link: `${ESTUDO}/${getMateriaString(Materias.Sociologia)}`,
      },
      {
        icon: Sociologia,
        alt: "atualidades",
        text: getMaterialLabel(Materias.Atualidades),
        link: `${ESTUDO}/${getMateriaString(Materias.Atualidades)}`,
      },
    ],
  },
  {
    id: 4,
    bg: "bg-orange",
    title: "Matemática",
    image: MatematicaImg,
    alt: "Matemática",
    subMenuList: [
      {
        icon: Matematica,
        alt: "calculadora",
        text: getMaterialLabel(Materias.Matematica),
        link: `${ESTUDO}/${getMateriaString(Materias.Matematica)}`,
      },
    ],
  },
  {
    id: 5,
    bg: "bg-green3",
    title: "Admin",
    image: HumanasImg,
    alt: "Admin",
    subMenuList: [
      {
        icon: Historia,
        alt: "localiza cursinho",
        text: "Validação LC",
        link: `/dashboard/${DASH_GEOLOCATION}`,
        permissions: [Roles.validarCursinho],
      },
      {
        icon: Quimica,
        alt: "usuarios",
        text: "Usuários",
        link: `/dashboard/${DASH_ROLES}`,
        permissions: [Roles.alterarPermissao],
      },
      {
        icon: Gramatica,
        alt: "banco_de_questao",
        text: "Banco de Questão",
        link: `/dashboard/${DASH_QUESTION}`,
        permissions: [Roles.visualizarQuestao],
      },
      {
        icon: Espanhol,
        alt: "dash_news",
        text: "Novidades",
        link: `/dashboard/${DASH_NEWS}`,
        permissions: [Roles.uploadNews],
      },
      {
        icon: Fisica,
        alt: "dash_provas",
        text: "Provas",
        link: `/dashboard/${DASH_PROVAS}`,
        permissions: [Roles.visualizarProvas],
      },
      {
        icon: Historia,
        alt: "dash_provas",
        text: "Conteúdos",
        link: `/dashboard/${DASH_CONTENT}`,
        permissions: [Roles.visualizarDemanda],
      },
      {
        icon: Matematica,
        alt: "dash_simulado",
        text: "Simulado",
        link: `/dashboard/${DASH_SIMULADO}`,
        permissions: [Roles.criarQuestao],
      },
      {
        icon: Report,
        alt: "error_report",
        text: "Reportar Erro",
        link: `https://docs.google.com/document/d/1VFpGiW4LuooMdtOemtFEVbqHMesP0rTZ1fX8BFwG_2w/edit?usp=sharing`,
        permissions: [
          Roles.alterarPermissao,
          Roles.cadastrarProvas,
          Roles.criarQuestao,
          Roles.criarSimulado,
          Roles.gerenciadorDemanda,
          Roles.uploadDemanda,
          Roles.uploadNews,
          Roles.validarCursinho,
          Roles.validarDemanda,
          Roles.validarQuestao,
          Roles.visualizarDemanda,
          Roles.visualizarProvas,
          Roles.visualizarQuestao,
        ],
      },
    ],
  },
];

export const Welcome = "Bem Vindos ao Você na Facul";
export const Subtitle = "Plataforma em construção!";
