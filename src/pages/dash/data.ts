import { HeaderProps } from "../../components/organisms/header";
import {header}  from "../Home/data";
import { BANK_QUESTION, DASHBOARD_GEOLOCATION, DASH_NEWS, ROLES } from "../../routes/path";
import BioExatasImg from "../../assets/images/dashboard/bioexatas.svg";
import HumanasImg from "../../assets/images/dashboard/humanas.svg";
import LinguagensImg from "../../assets/images/dashboard/linguagens.svg";
import { Roles } from "../../enums/roles/roles";
import { DashCardMenu } from "../../components/organisms/menuDash";

export const headerDash: HeaderProps = {...header, itemsMenu: [
    { id: 1, name: "Forum", link: "#" },
    { id: 2,name: "Simulado", link: "#" },
    { id: 3,name: "Redações", link: "#" },
    { id: 4,name: "Blog", link: "#" },
],};


export const dashCardList : DashCardMenu[] = [
    {
        id: 1,
        bg: "bg-marine",
        title: "Linguagens",
        image: LinguagensImg,
        alt: "Linguagens",
        subMenuList: [
            { icon: LinguagensImg, alt: "escrevendo", text: "LPT*", link: "#" },
            { icon: LinguagensImg, alt: "abc", text: "Gramática", link: "#" },
            { icon: LinguagensImg, alt: "livro", text: "Literatura", link: "#" },
            { icon: LinguagensImg, alt: "balão de fala retangular", text: "Inglês", link: "#" },
            { icon: LinguagensImg, alt: "balão de fala redondo", text: "Espanhol", link: "#" },
        ],
    },
    {
        id: 2,
        bg: "bg-pink",
        title: "BioExatas",
        image: BioExatasImg,
        alt: "BioExatas",
        subMenuList: [
            { icon: BioExatasImg, alt: "molécula de DNA", text: "Biologia", link: "#" },
            { icon: BioExatasImg, alt: "risco biológico", text: "Física", link: "#" },
            { icon: BioExatasImg, alt: "calculadora", text: "Matemática", link: "#" },
            { icon: BioExatasImg, alt: "dinheiro", text: "Financeira", link: "#" },
        ],
    },
    {
        id: 3,
        bg: "bg-lightGreen",
        title: "Humanas",
        image: HumanasImg,
        alt: "Humanas",
        subMenuList: [
            { icon: HumanasImg, alt: "relógio", text: "história", link: "#" },
            { icon: HumanasImg, alt: "mapa", text: "geografia", link: "#" },
            { icon: HumanasImg, alt: "pessoas", text: "filosofia", link: "#" },
            { icon: HumanasImg, alt: "pessoas", text: "sociologia", link: "#" },
        ],
    },
    {
        id: 4,
        bg: "bg-orange",
        title: "Admin",
        image: HumanasImg,
        alt: "Admin",
        subMenuList: [
            {
                icon: HumanasImg,
                alt: "check mapa",
                text: "Validação LC",
                link: DASHBOARD_GEOLOCATION,
                permission: Roles.validarCursinho,
            },
            { 
                icon: HumanasImg, 
                alt: "check", 
                text: "Permissões", 
                link: ROLES, 
                permission: Roles.alterarPermissao
            },
            { 
                icon: HumanasImg, 
                alt: "banco_de_questao", 
                text: "Banco de Questão", 
                link: BANK_QUESTION, 
                permission: Roles.bancoQuestoes
            },
            { 
                icon: HumanasImg, 
                alt: "dash_news", 
                text: "Novidades", 
                link: DASH_NEWS, 
                permission: Roles.uploadNews
            },
        ],
    },
];
