import HeroImg1 from "../../assets/images/home/hero_student.svg";
import HeroImg2 from "../../assets/images/home/hero_teacher.svg";
import HeroImg3 from "../../assets/images/home/hero_cursinho.svg";
import HeroImg4 from "../../assets/images/home/hero_sponsor.svg";
import HeroBackgroundImg1 from "../../assets/images/home/about-us-background.png";
import { Hero } from "./types";
import { REGISTER_PATH } from "../../routes/path";

export const hero: Hero = {
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
        },
    ],
};

export const backgroundGradients = [
    "linear-gradient(180deg, rgba(11,39,71,0.89) 0%, rgba(0,13,27,0.89) 100%)",
    "linear-gradient(180deg, rgba(218,0,90,0.89) 0%, rgba(172,0,71,0.89) 100%)",
    "linear-gradient(180deg, rgba(55,214,181,0.89) 0%, rgba(39,191,160,0.89) 100%)",
    "linear-gradient(180deg, rgba(140,196,8,0.89) 0%, rgba(15,155,44,0.89) 100%)",
];