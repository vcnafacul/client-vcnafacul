import { ItemMenuProps } from "../../components/molecules/menuItems";

import { HeaderData } from "../../components/organisms/header";

import {
  ACCOUNT_PATH,
  DASH,
  LOGIN_PATH,
  LOGOFF_PATH,
  NEWS,
  REGISTER_PATH,
} from "../../routes/path";

import { ReactComponent as FacebookIcon } from "../../assets/icons/facebook.svg";
import { ReactComponent as InstagramIcon } from "../../assets/icons/instagram.svg";
import { ReactComponent as LinkedinIcon } from "../../assets/icons/linkedin.svg";
import { ReactComponent as TwitterIcon } from "../../assets/icons/twitter.svg";
import { TypeMarker } from "../../types/map/marker";

import { AboutUsProps } from "../../components/organisms/aboutUs";
import { ActionProps } from "../../components/organisms/actionAreas";
import { FeaturesProps } from "../../components/organisms/features";
import { FooterProps } from "../../components/organisms/footer";
import { Slide } from "../../components/organisms/hero";

import HeroBackgroundImg1 from "../../assets/images/home/about-us-background.png";
import HeroImg3 from "../../assets/images/home/hero_cursinho.svg";
import HeroImg4 from "../../assets/images/home/hero_sponsor.svg";
import HeroImg1 from "../../assets/images/home/hero_student.svg";
import HeroImg2 from "../../assets/images/home/hero_teacher.svg";

import feature1 from "../../assets/images/home/1-Plataforma personalizada - comp.png";
import feature2 from "../../assets/images/home/2-Conteudos pre-vestibular - comp.png";
import feature4 from "../../assets/images/home/4-Exercicios e Simulados online - comp.png";
import feature5 from "../../assets/images/home/5-Forum de duvidas - comp.png";
import feature6 from "../../assets/images/home/6-Exercicios e Simulados online - comp.png";

import { ReactComponent as homeSubjectArte } from "../../assets/icons/home-subjects-arte.svg";
import { ReactComponent as homeSubjectAtualidades } from "../../assets/icons/home-subjects-atualidades.svg";
import { ReactComponent as homeSubjectBiologia } from "../../assets/icons/home-subjects-biologia.svg";
import { ReactComponent as homeSubjectEspanhol } from "../../assets/icons/home-subjects-espanhol.svg";
import { ReactComponent as homeSubjectFilosofia } from "../../assets/icons/home-subjects-filosofia.svg";
import { ReactComponent as homeSubjectFisica } from "../../assets/icons/home-subjects-fisica.svg";
import { ReactComponent as homeSubjectGeografia } from "../../assets/icons/home-subjects-geografia.svg";
import { ReactComponent as homeSubjectGramatica } from "../../assets/icons/home-subjects-gramatica.svg";
import { ReactComponent as homeSubjectHistoria } from "../../assets/icons/home-subjects-historia.svg";
import { ReactComponent as homeSubjectIngles } from "../../assets/icons/home-subjects-ingles.svg";
import { ReactComponent as homeSubjectLeituraProdTextos } from "../../assets/icons/home-subjects-leitura-prod-textos.svg";
import { ReactComponent as homeSubjectLiteratura } from "../../assets/icons/home-subjects-literatura.svg";
import { ReactComponent as homeSubjectMatematica } from "../../assets/icons/home-subjects-matematica.svg";
import { ReactComponent as homeSubjectQuimica } from "../../assets/icons/home-subjects-quimica.svg";
import { ReactComponent as homeSubjectSociologia } from "../../assets/icons/home-subjects-sociologia.svg";

import hostingerLogo from "../../assets/images/home/1200px-Hostinger_logo_purple.svg@2x.png";
import raccoonLogo from "../../assets/images/home/Grupo 1706.svg";
import wikilabLogo from "../../assets/images/home/Logo_WikiLab.png";
import UFSCarLogo from "../../assets/images/home/UFSCar.png";
import tumble from "../../assets/images/home/thumb-about-us.png";
import { SupportersProps } from "../../components/organisms/supporters";
import  JaquelineRibeiro from "../../assets/images/home/JaquelineRibeiro3.png";

export const userNavigationSign: ItemMenuProps[] = [
  {
    Home_Menu_Item_id: {
      id: 1,
      name: "Cadastro",
      link: REGISTER_PATH,
      target: "_self",
    },
  },
  {
    Home_Menu_Item_id: {
      id: 2,
      name: "Login",
      link: LOGIN_PATH,
      target: "_self",
    },
  },
];

export const userNavigationLogged: ItemMenuProps[] = [
  {
    Home_Menu_Item_id: {
      id: 1,
      name: "DashBoard",
      link: DASH,
      target: "_self",
    },
  },
  {
    Home_Menu_Item_id: {
      id: 2,
      name: "Perfil",
      link: `/dashboard/${ACCOUNT_PATH}`,
      target: "_self",
    },
  },
  {
    Home_Menu_Item_id: {
      id: 2,
      name: "Sair",
      link: LOGOFF_PATH,
      target: "_self",
    },
  },
];

export const header: HeaderData = {
  pageLinks: [
    {
      Home_Menu_Item_id: {
        id: 1,
        name: "Quem Somos",
        link: "/#about-us",
        target: "_self",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 2,
        name: "Localize um Cursinho",
        link: "/#map",
        target: "_self",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 3,
        name: "Apoiadores",
        link: "/#supporters",
        target: "_self",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 4,
        name: "Novidades",
        link: NEWS,
        target: "_self",
      },
    },
  ],
  socialLinks: [
    {
      Home_Menu_Item_id: {
        id: 5,
        name: "Facebook",
        link: "https://www.facebook.com/vcnafacul/",
        target: "_blank",
      },
      image: FacebookIcon,
    },
    {
      Home_Menu_Item_id: {
        id: 6,
        name: "Linkedin",
        link: "https://www.linkedin.com/company/vcnafacul/",
        target: "_blank",
      },
      image: LinkedinIcon,
    },
    {
      Home_Menu_Item_id: {
        id: 7,
        name: "Instagram",
        link: "https://www.instagram.com/vcnafacul/",
        target: "_blank",
      },
      image: InstagramIcon,
    },
    {
      Home_Menu_Item_id: {
        id: 8,
        name: "Quem Somos",
        link: "https://www.facebook.com/vcnafacul/",
        target: "_blank",
      },
      image: TwitterIcon,
    },
  ],
  userNavigationSign: userNavigationSign,
  userNavigationLogged: userNavigationLogged,
};

export const checkMapFilter = [
  {
    id: 1,
    name: "Cursinhos Populares",
    type: TypeMarker.geo,
    color: "fill-blueGeo",
  },
  {
    id: 2,
    name: "Universidades Públicas",
    type: TypeMarker.univPublic,
    color: "fill-red",
  },
];

export const hero: Slide[] = [
  {
    id: 1,
    title: "Nossa missão é ver VOCÊ NA FACUL!",
    subtitle:
      "Plataforma em construção! Cadastre-se para ser avisado para testá-la ou busque um cursinho presencial.",
    links: [
      {
        id: 1,
        text: "Faça o pré-cadastro",
        link: REGISTER_PATH,
        internal: true,
      },
      {
        id: 2,
        text: "Busque um cursinho",
        link: "#map",
        internal: true,
        target: "_self",
      },
    ],
    background_image: HeroBackgroundImg1,
    image: HeroImg1,
    backgroud_color:
      "linear-gradient(180deg, rgba(11,39,71,0.89) 0%, rgba(0,13,27,0.89) 100%)",
  },
  {
    id: 2,
    title: "Quer contribuir com esse projeto?",
    subtitle:
      "Venha fazer parte do nosso time de voluntários que estão fazendo tudo acontecer!",
    links: [
      {
        id: 3,
        text: "Seja um voluntário",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSeMw9aY9Qz3BCecidXo8_XaGiFgWiUq1ldJwRnP00e1bW1QHw/viewform",
        internal: false,
        target: "_blank",
      },
    ],
    background_image: HeroBackgroundImg1,
    image: HeroImg2,
    backgroud_color:
      "linear-gradient(180deg, rgba(218,0,90,0.89) 0%, rgba(172,0,71,0.89) 100%)",
  },
  {
    id: 3,
    title: "Cursinhos populares, vamos nessa!",
    subtitle:
      "Se você conhece algum cursinho popular cadastre no botão abaixo e ajude um aluno a encontrá-lo.",
    links: [
      {
        id: 4,
        text: "Cadastre um cursinho",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSf-VaK8qrxYx6qd-6WHV8aaaiOnR5cxMsQUaKhU3L1N3jNx0w/viewform",
        internal: false,
        target: "_blank",
      },
    ],
    background_image: HeroBackgroundImg1,
    image: HeroImg3,
    backgroud_color:
      "linear-gradient(180deg, rgba(55,214,181,0.89) 0%, rgba(39,191,160,0.89) 100%)",
  },
  {
    id: 4,
    title: "Empresas também podem contribuir.",
    subtitle:
      "Seu apoio é importante para nós! Saiba como sua empresa pode fazer parte dessa história.",
    links: [
      {
        id: 5,
        text: "Entre em contato",
        link: "mailto:contato@vcnafacul.com.br",
        internal: false,
        target: "_self",
      },
    ],
    background_image: HeroBackgroundImg1,
    image: HeroImg4,
    backgroud_color:
      "linear-gradient(180deg, rgba(140,196,8,0.89) 0%, rgba(15,155,44,0.89) 100%)",
  },
];

export const footer: FooterProps = {
  sitemapLinks: [
    {
      Home_Menu_Item_id: {
        id: 1,
        name: "Termos de Serviço",
        link: "/Termos de Uso.pdf",
        target: "_blank",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 2,
        name: "Politicas de Privacidade",
        link: "/Política de Privacidade.pdf",
        target: "_blank",
      },
    },
  ],
  pageLinks: [
    {
      Home_Menu_Item_id: {
        id: 1,
        name: "Quem Somos",
        link: "/#about-us",
        target: "_blank",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 2,
        name: "Localiza Cursinho",
        link: "/#map",
        target: "_blank",
      },
    },
    {
      Home_Menu_Item_id: {
        id: 3,
        name: "Apoiadores",
        link: "/#supporters",
        target: "_blank",
      },
    },
  ],
  slogan: "Equidade. Oportunidade. Realização.",
  contact: "contato@vcnafacul.com.br",
  socialLinks: [
    {
      image: "https://www.facebook.com/vcnafacul/",
      Home_Menu_Item_id: {
        id: 1,
        name: "Facebook",
        link: "https://www.facebook.com/vcnafacul/",
        target: "_blank",
      },
    },
    {
      image: "https://www.linkedin.com/company/vcnafacul/",
      Home_Menu_Item_id: {
        id: 2,
        name: "Linkedin",
        link: "https://www.linkedin.com/company/vcnafacul/",
        target: "_blank",
      },
    },
    {
      image: "https://www.instagram.com/vcnafacul/",
      Home_Menu_Item_id: {
        id: 3,
        name: "Instagran",
        link: "https://www.instagram.com/vcnafacul/",
        target: "_blank",
      },
    },
  ],
};

export const features: FeaturesProps = {
  title: "O futuro do cursinho popular",
  subtitle: "Veja tudo o que você terá acesso na nossa plataforma!",
  items: [
    {
      Home_Features_Item_id: {
        id: 1,
        title: "Simulados online do ENEM",
        subtitle:
          "O Você na Facul disponibiliza simulados automáticos com questões reais para você praticar quantas vezes quiser! E o resultado sai na hora! [EM EXPANSÃO]",
        image: feature6,
      },
    },
    {
      Home_Features_Item_id: {
        id: 2,
        title: "Conteúdos pré-vestibular",
        subtitle:
          "Você terá acesso aos melhores conteúdos pré-vestibular que existem hoje, que foram selecionados com carinho e organizados para você! [EM CONSTRUÇÃO]",
        image: feature2,
      },
    },
    {
      Home_Features_Item_id: {
        id: 3,
        title: "Plataforma personalizada",
        subtitle:
          "Ao acessar a plataforma Você na Facul você terá um painel só seu, personalizado de acordo com seu perfil e seu progresso nos estudos! [EM BREVE]",
        image: feature1,
      },
    },
    {
      Home_Features_Item_id: {
        id: 5,
        title: "Fórum de dúvidas",
        subtitle:
          "Tá com dúvidas sobre os conteúdos? É só mandar uma mensagem no fórum de dúvidas que algum professor vai te ajudar com o maior prazer! [EM BREVE]",
        image: feature5,
      },
    },
    {
      Home_Features_Item_id: {
        id: 4,
        title: "Suas redações corrigidas",
        subtitle:
          "OTá precisando melhorar nas redações? É só escrever quantas quiser e enviar pelo painel que um professor vai corrigir e dar sugestões de melhoria! [EM BREVE]",
        image: feature4,
      },
    },
  ],
};

export const actionAreas: ActionProps = {
  title: "Veja nossas áreas de ação",
  subtitle: "Disciplinas divididas de forma a facilitar o estudo para o ENEM",
  // tabItems: ["Linguagens", "Ciências da natureza e matemática", "Ciências humanas"],
  areas: [
    {
      Home_Action_Area_id: {
        id: 0,
        title: "Linguagens",
        items: [
          {
            Home_Action_Area_Item_id: {
              id: 1,
              image: homeSubjectLeituraProdTextos,
              title: "Leitura e Produção de Textos",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 2,
              image: homeSubjectGramatica,
              title: "Gramática",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 3,
              image: homeSubjectLiteratura,
              title: "Literatura",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 4,
              image: homeSubjectIngles,
              title: "Inglês",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 5,
              image: homeSubjectEspanhol,
              title: "Espanhol",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 6,
              image: homeSubjectArte,
              title: "Artes",
              subtitle: "",
            },
          },
        ],
      },
    },
    {
      Home_Action_Area_id: {
        id: 1,
        title: "Ciências da natureza e matemática",
        items: [
          {
            Home_Action_Area_Item_id: {
              id: 7,
              image: homeSubjectBiologia,
              title: "Biologia",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 8,
              image: homeSubjectFisica,
              title: "Física",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 9,
              image: homeSubjectQuimica,
              title: "Química",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 10,
              image: homeSubjectMatematica,
              title: "Matemática",
              subtitle: "",
            },
          },
        ],
      },
    },
    {
      Home_Action_Area_id: {
        id: 2,
        title: "Ciências humanas",
        items: [
          {
            Home_Action_Area_Item_id: {
              id: 11,
              image: homeSubjectSociologia,
              title: "Sociologia",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 12,
              image: homeSubjectFilosofia,
              title: "Filosofia",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 13,
              image: homeSubjectHistoria,
              title: "História",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 14,
              image: homeSubjectGeografia,
              title: "Geografia",
              subtitle: "",
            },
          },
          {
            Home_Action_Area_Item_id: {
              id: 15,
              image: homeSubjectAtualidades,
              title: "Atualidades",
              subtitle: "",
            },
          },
        ],
      },
    },
  ],
};

export const about_us: AboutUsProps = {
  title: "Quem somos?",
  description:
    "Somos uma equipe de voluntários trabalhando por um bem maior: a *Educação*. Queremos que o ambiente universitário seja justo e igualitário, e que o desejo de ingressar no ensino superior não dependa de cor, gênero, orientação sexual ou classe social.",
  thumbnail: tumble,
  videoID: "LiNm9JxvNOM",
};

export const supporters: SupportersProps = {
  title: "Nossos apoiadores!",
  subtitle: "Pessoas, cursinhos e empresas que sonham com a gente",
  sponsors: [
    {
      Patrocinador_id: {
        image: raccoonLogo,
        alt: "logo-raccoon",
        link: "https://raccoon.ag/",
      },
    },
    {
      Patrocinador_id: {
        image: hostingerLogo,
        alt: "logo-hostinger",
        link: "https://www.hostinger.com.br/",
      },
    },
    {
      Patrocinador_id: {
        image: wikilabLogo,
        alt: "logo-wikilab",
        link: "https://coworkingsaocarlos.com/",
      },
    },
    {
      Patrocinador_id: {
        image: JaquelineRibeiro,
        alt: "logo-jaquelineribeiro",
        link: "https://wa.me/55016981160654",
      },
    },
  ],
  volunteers: [],
  prepCourse: [
    {
      image: UFSCarLogo,
      alt: "logo-ufscar",
      link: "https://cursinho.faiufscar.com/#/",
    },
  ],
};

export const report = [
  {
    Home_Menu_Item_id: {
      id: 1,
      name: "Encontrei um Problema",
      link: "https://github.com/orgs/vcnafacul/discussions/new?category=problemas",
      target: "_blank",
    },
  },
  {
    Home_Menu_Item_id: {
      id: 1,
      name: "Tenho uma ideia",
      link: "https://github.com/orgs/vcnafacul/discussions/new?category=ideas",
      target: "_blank",
    },
  },
];
