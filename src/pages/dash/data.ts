import { HeaderProps } from "../../components/organisms/header";
import {header}  from "../home/data";
import { DASH_GEOLOCATION, DASH_NEWS, DASH_QUESTION, DASH_SIMULADO, DASH_ROLES, EM_BREVE, DASH_PROVAS, DASH_CONTENT, NEWS } from "../../routes/path";
import BioExatasImg from "../../assets/images/dashboard/bioexatas.svg";
import HumanasImg from "../../assets/images/dashboard/humanas.svg";
import LinguagensImg from "../../assets/images/dashboard/linguagens.svg";

import { ReactComponent as LPT } from "../../assets/icons/home-subjects-leitura-prod-textos.svg"
import { ReactComponent as Gramatica } from "../../assets/icons/home-subjects-gramatica.svg"
import { ReactComponent as Literatura } from "../../assets/icons/home-subjects-literatura.svg"
import { ReactComponent as Ingles } from "../../assets/icons/home-subjects-ingles.svg"
import { ReactComponent as Espanhol } from "../../assets/icons/home-subjects-espanhol.svg"

import { ReactComponent as Biologia } from "../../assets/icons/home-subjects-biologia.svg"
import { ReactComponent as Fisica } from "../../assets/icons/home-subjects-fisica.svg"
import { ReactComponent as Quimica } from "../../assets/icons/home-subjects-quimica.svg"
import { ReactComponent as Matematica } from "../../assets/icons/home-subjects-matematica.svg"


import { ReactComponent as Historia } from "../../assets/icons/home-subjects-historia.svg"
import { ReactComponent as Geografia } from "../../assets/icons/home-subjects-geografia.svg"
import { ReactComponent as Filosofia } from "../../assets/icons/home-subjects-filosofia.svg"
import { ReactComponent as Sociologia } from "../../assets/icons/home-subjects-sociologia.svg"


import { Roles } from "../../enums/roles/roles";
import { DashCardMenu } from "../../components/molecules/dashCard";

export const headerDash: HeaderProps = {...header, itemsMenu: [
    { id: 1, name: "Novidades", link: NEWS },
    { id: 2,name: "Simulado", link: DASH_SIMULADO },
],};


export const dashCardMenuItems : DashCardMenu[] = [
    {
        id: 1,
        bg: "bg-marine",
        title: "Linguagens",
        image: LinguagensImg,
        alt: "Linguagens",
        subMenuList: [
            { icon: LPT, alt: "escrevendo", text: "LPT*", link: `${EM_BREVE}/LPT` },
            { icon: Gramatica, alt: "abc", text: "Gramática", link: `${EM_BREVE}/Gramática` },
            { icon: Literatura, alt: "livro", text: "Literatura", link: `${EM_BREVE}/Literatura` },
            { icon: Ingles, alt: "balão de fala retangular", text: "Inglês", link: `${EM_BREVE}/Inglês` },
            { icon: Espanhol, alt: "balão de fala redondo", text: "Espanhol", link: `${EM_BREVE}/Espanhol` },
        ],
    },
    {
        id: 2,
        bg: "bg-pink",
        title: "BioExatas",
        image: BioExatasImg,
        alt: "BioExatas",
        subMenuList: [
            { icon: Biologia, alt: "molécula de DNA", text: "Biologia", link: `${EM_BREVE}/Biologia` },
            { icon: Fisica, alt: "risco biológico", text: "Física", link: `${EM_BREVE}/Física` },
            { icon: Quimica, alt: "quimica", text: "Quimica", link: `${EM_BREVE}/Quimica` },
            { icon: Matematica, alt: "calculadora", text: "Matemática", link: `${EM_BREVE}/Matemática` },
        ],
    },
    {
        id: 3,
        bg: "bg-lightGreen",
        title: "Humanas",
        image: HumanasImg,
        alt: "Humanas",
        subMenuList: [
            { icon: Historia, alt: "relógio", text: "História", link: `${EM_BREVE}/História` },
            { icon: Geografia, alt: "mapa", text: "Geografia", link: `${EM_BREVE}/Geografia` },
            { icon: Filosofia, alt: "pessoas", text: "Filosofia", link: `${EM_BREVE}/Filosofia` },
            { icon: Sociologia, alt: "pessoas", text: "Sociologia", link: `${EM_BREVE}/Sociologia` },
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
                icon: Historia,
                alt: "localiza cursinho",
                text: "Validação LC",
                link: `/dashboard/${DASH_GEOLOCATION}`,
                permission: Roles.validarCursinho,
            },
            { 
                icon: Quimica, 
                alt: "permissoes", 
                text: "Permissões", 
                link: `/dashboard/${DASH_ROLES}`,
                permission: Roles.alterarPermissao
            },
            { 
                icon: Gramatica, 
                alt: "banco_de_questao", 
                text: "Banco de Questão", 
                link: `/dashboard/${DASH_QUESTION}`, 
                permission: Roles.visualizarQuestao
            },
            { 
                icon: Espanhol, 
                alt: "dash_news", 
                text: "Novidades", 
                link: `/dashboard/${DASH_NEWS}`,
                permission: Roles.uploadNews
            },
            { 
                icon: Fisica, 
                alt: "dash_provas", 
                text: "Provas", 
                link: `/dashboard/${DASH_PROVAS}`,
                permission: Roles.visualizarProvas
            },
            { 
                icon: Historia, 
                alt: "dash_provas", 
                text: "Conteúdos", 
                link: `/dashboard/${DASH_CONTENT}`,
                permission: Roles.visualizarDemanda
            },
        ],
    },
];
