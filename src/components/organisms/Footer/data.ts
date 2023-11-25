import { Footer } from "./types";

export const footer: Footer = {
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