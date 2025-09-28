import { ReactComponent as AdminImg } from "../../assets/images/dashboard/Admin.svg";
import { ReactComponent as HumanasImg } from "../../assets/images/dashboard/humanas.svg";
import { ReactComponent as LinguagensImg } from "../../assets/images/dashboard/linguagens.svg";
import { ReactComponent as MatematicaImg } from "../../assets/images/dashboard/matematica.svg";
import { ReactComponent as NaturezaImg } from "../../assets/images/dashboard/natureza.svg";
import {
  DASH,
  DASH_ANALYTICS,
  DASH_CONTENT,
  DASH_GEOLOCATION,
  DASH_NEWS,
  DASH_PROVAS,
  DASH_QUESTION,
  DASH_ROLES,
  DASH_SIMULADO,
  ESTUDO,
  MANAGER_COLLABORATOR,
  NEWS,
  PARTNER_CLASS,
  PARTNER_CLASS_STUDENTS,
  PARTNER_PREP_INSCRIPTION,
  SIMULADO,
} from "../../routes/path";

import { ReactComponent as Artes } from "../../assets/icons/home-subjects-arte.svg";
import { ReactComponent as Espanhol } from "../../assets/icons/home-subjects-espanhol.svg";
import { ReactComponent as Gramatica } from "../../assets/icons/home-subjects-gramatica.svg";
import { ReactComponent as Ingles } from "../../assets/icons/home-subjects-ingles.svg";

import { ReactComponent as Biologia } from "../../assets/icons/home-subjects-biologia.svg";
import { ReactComponent as Fisica } from "../../assets/icons/home-subjects-fisica.svg";
import { ReactComponent as Matematica } from "../../assets/icons/home-subjects-matematica.svg";
import { ReactComponent as Quimica } from "../../assets/icons/home-subjects-quimica.svg";

import { GoGraph } from "react-icons/go";
import { ReactComponent as Atualidades } from "../../assets/icons/home-subjects-atualidades.svg";
import { ReactComponent as Filosofia } from "../../assets/icons/home-subjects-filosofia.svg";
import { ReactComponent as Geografia } from "../../assets/icons/home-subjects-geografia.svg";
import { ReactComponent as Historia } from "../../assets/icons/home-subjects-historia.svg";
import { ReactComponent as Sociologia } from "../../assets/icons/home-subjects-sociologia.svg";

import { BiSolidSchool } from "react-icons/bi";
import { FaPeopleGroup } from "react-icons/fa6";
import { PiStudentFill, PiUsersFourBold } from "react-icons/pi";

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
    id: 6,
    bg: "bg-red",
    title: "Cursinho",
    image: AdminImg,
    alt: "Cursinho",
    subMenuList: [
      {
        icon: PiStudentFill,
        alt: "processos seletivos",
        text: "Processos Seletivos",
        link: `/dashboard/${PARTNER_PREP_INSCRIPTION}`,
        permissions: [Roles.gerenciarProcessoSeletivo],
      },
      {
        icon: FaPeopleGroup,
        alt: "colaboradores",
        text: "Colaboradores",
        link: `/dashboard/${MANAGER_COLLABORATOR}`,
        permissions: [Roles.gerenciarColaboradores],
      },
      {
        icon: BiSolidSchool,
        alt: "turmas",
        text: "Turmas",
        link: `/dashboard/${PARTNER_CLASS}`,
        permissions: [Roles.visualizarTurmas],
      },
      {
        icon: PiUsersFourBold,
        alt: "matriculados",
        text: "Estudantes",
        link: `/dashboard/${PARTNER_CLASS_STUDENTS}`,
        permissions: [Roles.visualizarEstudantes],
      },
    ],
  },
  {
    id: 5,
    bg: "bg-green3",
    title: "Admin",
    image: AdminImg,
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
        icon: GoGraph,
        alt: "dash_analytics",
        text: "Monitoramento",
        link: `/dashboard/${DASH_ANALYTICS}`,
        permissions: [Roles.criarQuestao],
      },
    ],
  },

  {
    id: 1,
    bg: "bg-marine",
    title: "Linguagens",
    image: LinguagensImg,
    alt: "Linguagens",
    subMenuList: [
      {
        icon: Gramatica,
        alt: "língua portuguesa",
        text: getMaterialLabel(Materias.LinguaPortuguesa),
        link: `${ESTUDO}/${getMateriaString(Materias.LinguaPortuguesa)}`,
      },
      {
        icon: Ingles,
        alt: "língua estrangeira",
        text: getMaterialLabel(Materias.LinguaEstrangeira),
        link: `${ESTUDO}/${getMateriaString(Materias.LinguaEstrangeira)}`,
      },
      {
        icon: Artes,
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
        icon: Atualidades,
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
];

export const Welcome = "Bem-vindos ao Você na Facul";
export const Subtitle = "Plataforma em construção!";
