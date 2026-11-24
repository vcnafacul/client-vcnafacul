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
  DASH_GLOBAL_FORM,
  DASH_HOME,
  DASH_NEWS,
  DASH_PUSH,
  DASH_PROVAS,
  DASH_QUESTION,
  DASH_ROLES,
  DASH_SUPPORT,
  DASH_PARTNER_SUPPORT,
  ESSAY_REVIEW_CURSINHO,
  ESSAY_REVIEW_LIST,
  ESSAY_THEME_ADMIN,
  ESSAY_WRITE,
  ESTUDO,
  MANAGER_COLLABORATOR,
  PARTNER_PAGINA,
  NEWS,
  PARTNER_CLASS,
  PARTNER_CLASS_FORM,
  PARTNER_CLASS_STUDENTS,
  PARTNER_INDICADORES,
  PARTNER_PREP_INSCRIPTION,
  PARTNER_PREP_MANAGER,
  PARTNER_PROVAS,
  REGISTRATION_MONITOR,
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

import { Bell, Book, ChartColumnIncreasing, ChartLine, ClipboardList, ClipboardPen, Globe, GraduationCap, House, MessageSquare, School, Users, UsersRound } from "lucide-react";
import { ReactComponent as Atualidades } from "../../assets/icons/home-subjects-atualidades.svg";
import { ReactComponent as Filosofia } from "../../assets/icons/home-subjects-filosofia.svg";
import { ReactComponent as Geografia } from "../../assets/icons/home-subjects-geografia.svg";
import { ReactComponent as Historia } from "../../assets/icons/home-subjects-historia.svg";
import { ReactComponent as Sociologia } from "../../assets/icons/home-subjects-sociologia.svg";


import { getIconPreset } from "../../config/materiaPresets";
import { DashCardMenu } from "../../components/molecules/dashCard";
import { SubDashCardInfo } from "../../components/molecules/subDashCard";
import { HeaderData } from "../../components/organisms/header";
import { Roles } from "../../enums/roles/roles";
import { AreaWithMaterias } from "../../services/content/getMateriasGroupedByArea";
import { header } from "../homeLegacy/data";

export const headerDash: HeaderData = {
  ...header,
  pageLinks: [
    {
      Home_Menu_Item_id: {
        id: 0,
        name: "Dashboard",
        link: DASH,
        target: "_self",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 1,
        name: "Novidades",
        link: NEWS,
        target: "_self",
      },
    },
  ],
};

// Cards administrativos (estáticos)
export const adminMenuItems: DashCardMenu[] = [
  {
    id: 6,
    bg: "bg-identity-cursinho",
    title: "Cursinho",
    image: AdminImg,
    alt: "Cursinho",
    subMenuList: [
      {
        icon: GraduationCap,
        alt: "processos seletivos",
        text: "Processos Seletivos",
        link: `/dashboard/${PARTNER_PREP_INSCRIPTION}`,
        permissions: [Roles.gerenciarProcessoSeletivo],
      },
      {
        icon: Globe,
        alt: "página do cursinho",
        text: "Página do cursinho",
        link: `/dashboard/${PARTNER_PAGINA}`,
        // tickets/025: qualquer uma das duas.
        permissions: [Roles.gerenciarPermissoesCursinho, Roles.gerenciarEstudantes],
      },
      {
        icon: Users,
        alt: "colaboradores",
        text: "Colaboradores",
        link: `/dashboard/${MANAGER_COLLABORATOR}`,
        permissions: [Roles.gerenciarColaboradores],
      },
      {
        icon: School,
        alt: "turmas",
        text: "Turmas",
        link: `/dashboard/${PARTNER_CLASS}`,
        permissions: [Roles.visualizarTurmas],
      },
      {
        icon: UsersRound,
        alt: "matriculados",
        text: "Estudantes",
        link: `/dashboard/${PARTNER_CLASS_STUDENTS}`,
        permissions: [Roles.visualizarEstudantes],
      },
      {
        icon: ChartColumnIncreasing,
        alt: "indicadores",
        text: "Indicadores",
        link: `/dashboard/${PARTNER_INDICADORES}`,
        // tickets/033 (R7): as mesmas da lista de estudantes; tickets/045: e o
        // admin da plataforma, que escolhe o cursinho no topo da tela.
        permissions: [
          Roles.visualizarEstudantes,
          Roles.gerenciarEstudantes,
          Roles.alterarPermissao,
        ],
      },
      {
        icon: ClipboardPen,
        alt: "formulário",
        text: "Formulário",
        link: `/dashboard/${PARTNER_CLASS_FORM}`,
        permissions: [Roles.gerenciarFormulario],
      },
      {
        icon: Fisica,
        alt: "provas cursinho",
        text: "Provas",
        link: `/dashboard/${PARTNER_PROVAS}`,
        permissions: [Roles.visualizarProvasCursinho],
      },
      {
        icon: Book,
        alt: "revisao redacoes",
        text: "Revisão de Redações",
        link: `/dashboard/${ESSAY_REVIEW_CURSINHO}`,
        permissions: [Roles.revisarRedacoes],
      },
      {
        icon: MessageSquare,
        alt: "suporte cursinho",
        text: "Suporte / Chat",
        link: `/dashboard/${DASH_PARTNER_SUPPORT}`,
        permissions: [Roles.partnerPrepSupportAgent],
      },
    ],
  },
  {
    id: 8,
    bg: "bg-identity-projeto",
    title: "Projeto",
    image: AdminImg,
    alt: "Projeto",
    subMenuList: [
      {
        icon: Gramatica,
        alt: "banco_de_questao",
        text: "Banco de Questão",
        link: `/dashboard/${DASH_QUESTION}`,
        // tickets/023, card 08: o banco também é do cursinho.
        permissions: [
          Roles.visualizarQuestao,
          Roles.visualizarQuestoesCursinho,
          Roles.editarQuestoesCursinho,
          Roles.validarQuestoesCursinho,
        ],
      },
      {
        icon: Historia,
        alt: "dash_conteudos",
        text: "Conteúdos",
        link: `/dashboard/${DASH_CONTENT}`,
        permissions: [Roles.visualizarDemanda],
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
        icon: Book,
        alt: "redacao",
        text: "Redação",
        link: `/dashboard/${ESSAY_THEME_ADMIN}`,
        permissions: [Roles.gerenciarTemas],
      },
      {
        icon: ClipboardList,
        alt: "revisao redacoes",
        text: "Revisão de Redações",
        link: `/dashboard/${ESSAY_REVIEW_LIST}`,
        permissions: [Roles.revisarTodasRedacoes],
      },
      {
        icon: Historia,
        alt: "localiza cursinho",
        text: "Validação LC",
        link: `/dashboard/${DASH_GEOLOCATION}`,
        permissions: [Roles.validarCursinho],
      },
    ],
  },
  {
    id: 5,
    bg: "bg-identity-admin",
    title: "Admin",
    image: AdminImg,
    alt: "Admin",
    subMenuList: [
      {
        icon: ClipboardPen,
        alt: "formulario_global",
        text: "Formulário Global",
        link: `/dashboard/${DASH_GLOBAL_FORM}`,
        permissions: [Roles.gerenciarFormularioGlobal],
      },
      {
        icon: GraduationCap,
        alt: "gerenciamento_cursinho",
        text: "Gerenciamento de Cursinho",
        link: `/dashboard/${PARTNER_PREP_MANAGER}`,
        permissions: [Roles.alterarPermissao],
      },
      {
        icon: Bell,
        alt: "notificacoes_push",
        text: "Notificações",
        link: `/dashboard/${DASH_PUSH}`,
        permissions: [Roles.enviarNotificacao],
      },
      {
        icon: House,
        alt: "dash_home",
        text: "Home",
        link: `/dashboard/${DASH_HOME}`,
        permissions: [Roles.alterarPermissao],
      },
      {
        icon: ChartLine,
        alt: "dash_analytics",
        text: "Monitoramento",
        link: `/dashboard/${DASH_ANALYTICS}`,
        permissions: [Roles.criarQuestao],
      },
      {
        icon: MessageSquare,
        alt: "suporte",
        text: "Suporte",
        link: `/dashboard/${DASH_SUPPORT}`,
        permissions: [Roles.supportAgent],
      },
      {
        icon: Quimica,
        alt: "usuarios",
        text: "Usuários",
        link: `/dashboard/${DASH_ROLES}`,
        permissions: [Roles.alterarPermissao],
      },
    ],
  },
];

export const studentMenuItem: DashCardMenu = {
  id: 7,
  bg: "bg-identity-estudos",
  title: "Meus Estudos",
  image: GraduationCap,
  alt: "Meus Estudos",
  subMenuList: [
    {
      icon: ClipboardList,
      alt: "processos seletivos",
      text: "Inscrições",
      link: `/dashboard/${REGISTRATION_MONITOR}`,
      permissions: [Roles.visualizarMinhasInscricoes],
    },
    {
      icon: Book,
      alt: "redacoes",
      text: "Redações",
      link: `/dashboard/${ESSAY_WRITE}`,
      permissions: [Roles.visualizarMinhasInscricoes],
    },
    {
      icon: ChartLine,
      alt: "simulados",
      text: "Simulados",
      link: `${DASH}/${SIMULADO}`,
    },
  ],
};

// Mapeamento de área do ENEM → configuração visual
const areaConfig: Record<
  string,
  {
    id: number;
    bg: string;
    image: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    title: string;
  }
> = {
  Linguagens: {
    id: 1,
    bg: "bg-identity-linguagens",
    image: LinguagensImg,
    title: "Linguagens",
  },
  "Ciências da Natureza": {
    id: 2,
    bg: "bg-identity-natureza",
    image: NaturezaImg,
    title: "Natureza",
  },
  "Ciências Humanas": {
    id: 3,
    bg: "bg-identity-humanas",
    image: HumanasImg,
    title: "Humanas",
  },
  Matemática: {
    id: 4,
    bg: "bg-identity-matematica",
    image: MatematicaImg,
    title: "Matemática",
  },
};

// Mapeamento de nome da matéria → ícone e slug para rota
const materiaConfig: Record<
  string,
  {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    slug: string;
  }
> = {
  "Língua Portuguesa": { icon: Gramatica, slug: "LinguaPortuguesa" },
  "Língua Estrangeira": { icon: Ingles, slug: "LinguaEstrangeira" },
  Artes: { icon: Artes, slug: "Artes" },
  Biologia: { icon: Biologia, slug: "Biologia" },
  Física: { icon: Fisica, slug: "Fisica" },
  Química: { icon: Quimica, slug: "Quimica" },
  Matemática: { icon: Matematica, slug: "Matematica" },
  História: { icon: Historia, slug: "Historia" },
  Geografia: { icon: Geografia, slug: "Geografia" },
  Filosofia: { icon: Filosofia, slug: "Filosofia" },
  Sociologia: { icon: Sociologia, slug: "Sociologia" },
  Atualidades: { icon: Atualidades, slug: "Atualidades" },
};

export function buildAcademicMenuItems(
  areas: AreaWithMaterias[],
): DashCardMenu[] {
  return areas
    .map((area) => {
      const config = areaConfig[area.enemArea];
      if (!config) return null;

      const subMenuList: SubDashCardInfo[] = area.materias.map((materia) => {
        const icon = materia.icon
          ? getIconPreset(materia.icon)
          : (materiaConfig[materia.nome]?.icon ?? Book);
        return {
          icon,
          alt: materia.nome.toLowerCase(),
          text: materia.nome,
          link: `${ESTUDO}/${materia._id}`,
        };
      });

      return {
        id: config.id,
        bg: config.bg,
        title: config.title,
        image: config.image,
        alt: config.title,
        subMenuList,
      };
    })
    .filter((item): item is DashCardMenu => item !== null);
}

// Fallback hardcoded para quando a API não estiver disponível
export const fallbackAcademicMenuItems: DashCardMenu[] = [
  {
    id: 1,
    bg: "bg-identity-linguagens",
    title: "Linguagens",
    image: LinguagensImg,
    alt: "Linguagens",
    subMenuList: [
      {
        icon: Gramatica,
        alt: "língua portuguesa",
        text: "Língua Portuguesa",
        link: `${ESTUDO}/LinguaPortuguesa`,
      },
      {
        icon: Ingles,
        alt: "língua estrangeira",
        text: "Língua Estrangeira",
        link: `${ESTUDO}/LinguaEstrangeira`,
      },
      { icon: Artes, alt: "artes", text: "Artes", link: `${ESTUDO}/Artes` },
    ],
  },
  {
    id: 2,
    bg: "bg-identity-natureza",
    title: "Natureza",
    image: NaturezaImg,
    alt: "Natureza",
    subMenuList: [
      {
        icon: Biologia,
        alt: "molécula de DNA",
        text: "Biologia",
        link: `${ESTUDO}/Biologia`,
      },
      {
        icon: Fisica,
        alt: "risco biológico",
        text: "Física",
        link: `${ESTUDO}/Fisica`,
      },
      {
        icon: Quimica,
        alt: "quimica",
        text: "Quimica",
        link: `${ESTUDO}/Quimica`,
      },
    ],
  },
  {
    id: 3,
    bg: "bg-identity-humanas",
    title: "Humanas",
    image: HumanasImg,
    alt: "Humanas",
    subMenuList: [
      {
        icon: Historia,
        alt: "História",
        text: "História",
        link: `${ESTUDO}/Historia`,
      },
      {
        icon: Geografia,
        alt: "Geografia",
        text: "Geografia",
        link: `${ESTUDO}/Geografia`,
      },
      {
        icon: Filosofia,
        alt: "Filosofia",
        text: "Filosofia",
        link: `${ESTUDO}/Filosofia`,
      },
      {
        icon: Sociologia,
        alt: "Sociologia",
        text: "Sociologia",
        link: `${ESTUDO}/Sociologia`,
      },
      {
        icon: Atualidades,
        alt: "atualidades",
        text: "Atualidades",
        link: `${ESTUDO}/Atualidades`,
      },
    ],
  },
  {
    id: 4,
    bg: "bg-identity-matematica",
    title: "Matemática",
    image: MatematicaImg,
    alt: "Matemática",
    subMenuList: [
      {
        icon: Matematica,
        alt: "calculadora",
        text: "Matemática",
        link: `${ESTUDO}/Matematica`,
      },
    ],
  },
];

export const Welcome = "Bem-vindos ao Você na Facul";
export const Subtitle = "Plataforma em construção!";
