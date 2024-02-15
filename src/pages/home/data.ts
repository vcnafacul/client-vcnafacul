import { HeaderProps } from "../../components/organisms/header";
import { FooterProps } from "../../components/organisms/footer";
import { SupportersProps } from "../../components/organisms/Supporters";

import { ACCOUNT_PATH, DASH, LOGIN_PATH, LOGOFF_PATH, NEWS, REGISTER_PATH } from "../../routes/path";

import raccoonLogo from "../../assets/images/home/Grupo 1706.svg";
import hostingerLogo from "../../assets/images/home/1200px-Hostinger_logo_purple.svg@2x.png";
import wikilabLogo from "../../assets/images/home/Logo_WikiLab.png";

export const userNavigationSign = [
    { name: 'Cadastro', href: REGISTER_PATH },
    { name: 'Login', href: LOGIN_PATH },
  ]

export const userNavigationLogged = [
    { name: 'DashBoard', href: DASH },
    { name: 'Editar Perfil', href: `/dashboard/${ACCOUNT_PATH}` },
    { name: 'Sair', href: LOGOFF_PATH },
]

export const header: HeaderProps = {
    homeLink: "/",
    itemsMenu: [
        { id: 1, name: "Quem Somos", link: "/#about-us" },
        { id: 2,name: "Localize um Cursinho", link: "/#map" },
        { id: 3,name: "Apoiadores", link: "/#supporters" },
        { id: 4, name: "Novidades", link: NEWS },
    ],
    socialLinks: {
        facebook: "https://www.facebook.com/vcnafacul/",
        linkedin: "https://www.linkedin.com/company/vcnafacul/",
        instagram: "https://www.instagram.com/vcnafacul/",
    },
    userNavigationSign: userNavigationSign,
    userNavigationLogged: userNavigationLogged,
    solid: false,
};

export const footer: FooterProps = {
    sitemapLinks: [
        { id: 1, name: "Termos de Serviço", link: "/Termos de Uso.pdf" },
        { id: 2,name: "Politicas de Privacidade", link: "/Política de Privacidade.pdf" },
    ],
    pageLinks: [
        { id: 1, name: "Quem Somos", link: "/#about-us" },
        { id: 2, name: "Localiza Cursinho", link: "/#map" },
        { id: 3,name: "Apoiadores", link: "/#supporters" },
    ],
    slogan: "Equidade. Oportunidade. Realização.",
    email: "contato@vcnafacul.com.br",
    socialLinks: {
        facebook: "https://www.facebook.com/vcnafacul/",
        linkedin: "https://www.linkedin.com/company/vcnafacul/",
        instagram: "https://www.instagram.com/vcnafacul/",
    },
};

export const supporters : SupportersProps = {
    title: 'Nossos apoiadores!',
    subtitle: 'Pessoas e empresas que sonharam com a gente',
    tabItems: ["Empresas" , "Voluntários"],
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