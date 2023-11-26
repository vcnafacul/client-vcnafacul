import { HeaderProps } from "../../components/organisms/header";
import { HeroProps } from "../../components/organisms/hero";
import { FooterProps } from "../../components/organisms/footer";
import { FeaturesProps } from "../../components/organisms/features";
import { ActionAreasProps } from "../../components/organisms/actionAreas";
import { AboutUsProps } from "../../components/organisms/aboutUs";
import { SupportersProps } from "../../components/organisms/Supporters";

import { REGISTER_PATH } from "../../routes/path";

import HeroImg1 from "../../assets/images/home/hero_student.svg";
import HeroImg2 from "../../assets/images/home/hero_teacher.svg";
import HeroImg3 from "../../assets/images/home/hero_cursinho.svg";
import HeroImg4 from "../../assets/images/home/hero_sponsor.svg";
import HeroBackgroundImg1 from "../../assets/images/home/about-us-background.png";

import feature1 from "../../assets/images/home/1-Plataforma personalizada - comp.png";
import feature2 from "../../assets/images/home/2-Conteudos pre-vestibular - comp.png";
import feature3 from "../../assets/images/home/3-Redaçoes corrigidas - comp.png";
import feature4 from "../../assets/images/home/4-Exercicios e Simulados online - comp.png";
import feature5 from "../../assets/images/home/5-Forum de duvidas - comp.png";

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

import raccoonLogo from "../../assets/images/home/Grupo 1706.svg";
import hostingerLogo from "../../assets/images/home/1200px-Hostinger_logo_purple.svg@2x.png";
import wikilabLogo from "../../assets/images/home/Logo_WikiLab.png";

export const header: HeaderProps = {
    homeLink: "/",
    itemsMenu: [
        { id: 1, name: "Quem Somos", link: "/#about-us" },
        { id: 2,name: "Localize um Cursinho", link: "/#map" },
        { id: 3,name: "Apoiadores", link: "/#supporters" },
    ],
    socialLinks: {
        facebook: "https://www.facebook.com/vcnafacul/",
        linkedin: "https://www.linkedin.com/company/vcnafacul/",
        instagram: "https://www.instagram.com/vcnafacul/",
    }
};

export const hero: HeroProps = {
    slides: [
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
            backgroud_color: "linear-gradient(180deg, rgba(11,39,71,0.89) 0%, rgba(0,13,27,0.89) 100%)",
        },
        {
            id: 2,
            title: "Quer contribuir com esse projeto?",
            subtitle: "Venha fazer parte do nosso time de voluntários que estão fazendo tudo acontecer!",
            links: [
                {
                    id: 3,
                    text: "Seja um voluntário",
                    link:
                        "https://docs.google.com/forms/d/e/1FAIpQLSeMw9aY9Qz3BCecidXo8_XaGiFgWiUq1ldJwRnP00e1bW1QHw/viewform",
                    internal: false,
                    target: "_blank",
                },
            ],
            background_image: HeroBackgroundImg1,
            image: HeroImg2,
            backgroud_color: "linear-gradient(180deg, rgba(218,0,90,0.89) 0%, rgba(172,0,71,0.89) 100%)",
        },
        {
            id: 3,
            title: "Cursinhos populares, vamos nessa!",
            subtitle: "Se você conhece algum cursinho popular cadastre no botão abaixo e ajude um aluno a encontrá-lo.",
            links: [
                {
                    id: 4,
                    text: "Cadastre um cursinho",
                    link:
                        "https://docs.google.com/forms/d/e/1FAIpQLSf-VaK8qrxYx6qd-6WHV8aaaiOnR5cxMsQUaKhU3L1N3jNx0w/viewform",
                    internal: false,
                    target: "_blank",
                },
            ],
            background_image: HeroBackgroundImg1,
            image: HeroImg3,
            backgroud_color: "linear-gradient(180deg, rgba(55,214,181,0.89) 0%, rgba(39,191,160,0.89) 100%)",
        },
        {
            id: 4,
            title: "Empresas também podem contribuir.",
            subtitle: "Seu apoio é importante para nós! Saiba como sua empresa pode fazer parte dessa história.",
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
            backgroud_color: "linear-gradient(180deg, rgba(140,196,8,0.89) 0%, rgba(15,155,44,0.89) 100%)",
        },
    ],
};

export const footer: FooterProps = {
    sitemapLinks: [
        { id: 1, name: "Termos de Serviço", link: "/Termos de Uso.pdf" },
        { id: 2,name: "Politicas de Privacidade", link: "/Política de Privacidade.pdf" },
    ],
    pageLinks: [
        { id: 1, name: "Quem Somos", link: "#" },
        { id: 2, name: "Localiza Cursinho", link: "#" },
        { id: 3, name: "Blog", link: "#" },
    ],
    slogan: "Equidade. Oportunidade. Realização.",
    email: "contato@vcnafacul.com.br",
    socialLinks: {
        facebook: "https://www.facebook.com/vcnafacul/",
        linkedin: "https://www.linkedin.com/company/vcnafacul/",
        instagram: "https://www.instagram.com/vcnafacul/",
    },
};

export const features : FeaturesProps = {
    title: 'O futuro do cursinho popular',
    subtitle: 'Veja tudo o que você terá acesso na nossa plataforma!',
    feats: [
        {
            id: 1,
            title: "Plataforma personalizada",
            subtitle: "Ao acessar a plataforma Você na Facul você terá um painel só seu, personalizado de acordo com seu perfil e seu progresso nos estudos! [EM BREVE]",
            image: feature1,
        },
        {
            id: 2,
            title: "Conteúdos pré-vestibular",
            subtitle:  "Você terá acesso aos melhores conteúdos pré-vestibular que existem hoje, que foram selecionados com carinho e organizados para você! [EM BREVE]",
            image: feature2,
        },
        {
            id: 3,
            title: "Suas redações corrigidas",
            subtitle: "Tá precisando melhorar nas redações? É só escrever quantas quiser e enviar pelo painel que um professor vai corrigir e dar sugestões de melhoria! [EM BREVE]",
            image: feature3,
        },
        {
            id: 4,
            title: "Exercícios e Simulados online",
            subtitle: "O Você na Facul disponibiliza simulados automáticos com questões reais para você praticar quantas vezes quiser! E o resultado sai na hora! [EM BREVE]",
            image: feature4,
        },
        {
            id: 5,
            title: "Fórum de dúvidas",
            subtitle: "Tá com dúvidas sobre os conteúdos? É só mandar uma mensagem no fórum de dúvidas que algum professor vai te ajudar com o maior prazer! [EM BREVE]",
            image: feature5,
        },
    ]
}


export const actionAreas : ActionAreasProps = {
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


export const about_us : AboutUsProps = {
    title: "Quem somos?",
    subtitle:
        "Somos uma equipe de voluntários trabalhando por um bem maior: a *Educação*. Queremos que o ambiente universitário seja justo e igualitário, e que o desejo de ingressar no ensino superior não dependa de cor, gênero, orientação sexual ou classe social.",
    cta: {
        text: "Conheça nossa história",
        link: "#",
    },
    video: {
        thumbnail: "/src/assets/images/home/thumb-about-us.png",
        videoID: "LiNm9JxvNOM",
    }
};

export const supporters : SupportersProps = {
    title: 'Nossos apoiadores!',
    subtitle: 'Pessoas e empresas que sonharam com a gente',
    tabItems: ["Empresas" /*, "Voluntários"*/],
    sponsors: [
        {
            image: raccoonLogo,
            alt: "logo-raccoon",
            link: "https://raccoon.ag/",
        },
        {
            image: hostingerLogo,
            alt: "logo-hostinger",
            link: "https://www.hostinger.com.br/",
        },
        {
            image: wikilabLogo,
            alt: "logo-wikilab",
            link: "https://coworkingsaocarlos.com/",
        },
    ],
    volunteers: []
};