import  { ReactComponent as Linguagens } from "../../assets/images/dashboard/linguagens.svg";
import  { ReactComponent as Natureza } from "../../assets/images/dashboard/natureza.svg";
import  { ReactComponent as Humanas } from "../../assets/images/dashboard/humanas.svg";
import  { ReactComponent as Matematica } from "../../assets/images/dashboard/matematica.svg";
import { TipoSimulados } from "../../enums/simulado/tipoSimulados";
import { ISimulateData } from "../../types/simulado/ISimulateData";

const textLinguagens = "Esta prova contêm questões da área Linguagem, Código e suas Tecnologias"
const textNatureza = "Esta prova contêm questões da área Ciência da Natureza e suas Tecnologias"
const textHumanas = "Esta prova contêm questões da área Ciência Humanas e suas Tecnologias"
const textMatematica = "Esta prova contêm questões da área Matemática e suas Tecnologias"
const itemsEnem1 = [
  "90 Questões",
  "Caderno de Ciência Humana",
  "Caderno de Linguagens e Código"
]

const itemsEnem2 = [
  "90 Questões",
  "Caderno de Ciência Humana",
  "Caderno de Linguagens e Código"
]

export const simulateData : ISimulateData = {
    titleBook: 'Simulado por Caderno',
    subTitleBook: 'Realize um simulado mais rapido contento apenas 45 questões de um das áreas do conhecimentro do ENEM.',
    simulateCardsBook : [
        {id: 1, tipo: TipoSimulados.Linguagens, subTitle: textLinguagens,  icon: Linguagens, className: 'border-marine', color: 'bg-marine'},
        {id: 2, tipo: TipoSimulados.Natureza, subTitle: textNatureza, icon: Natureza, className: 'border-pink', color: 'bg-pink'},
        {id: 3, tipo: TipoSimulados.Humanas, subTitle: textHumanas, icon: Humanas, className: 'border-green', color: 'bg-green'},
        {id: 4, tipo: TipoSimulados.Matematica, subTitle: textMatematica, icon: Matematica, className: 'border-red', color: 'bg-red'}
    ],
    titleDay: 'Simulado por Dia',
    subTitleDay: 'Realize um simulado contendo 90 questões assim como cada um dos dias do ENEM.',
    simulateCardsDay : [
        {id: 5, tipo: TipoSimulados.Enem1, item: itemsEnem1, icon: Linguagens, className: 'border-orange', color: 'bg-orange'},
        {id: 6, tipo: TipoSimulados.Enem2, item: itemsEnem2, icon: Natureza, className: 'border-orange', color: 'bg-orange'}
    ],
}

export const getIconByTitle = (title: string) => {
  switch (title) {
    case TipoSimulados.Linguagens:
      return Linguagens
    case TipoSimulados.Natureza:
      return Natureza
    case TipoSimulados.Humanas:
      return Humanas
    case TipoSimulados.Matematica:
      return Matematica
    default:
      return ""
  }
}

export const breakpointsBook = {
  1: {
      slidesPerView: 1,
      loop: false
  },
  896: {
      slidesPerView: 2,
      centeredSlides: false,
      loop: false
  },
  1120: {
      slidesPerView: 2.2,
      centeredSlides: false,
      loop: false
  },
  1344: {
      slidesPerView: 2.5,
      centeredSlides: false,
      loop: false
  },
  1568: {
      slidesPerView: 3.1,
      centeredSlides: false,
      loop: false
  },
  1800: {
      slidesPerView: 3.4,
      centeredSlides: false,
      loop: false
  },
  2277: {
      slidesPerView: 4,
      centeredSlides: false
  },
}

export const breakpointsDay = {
  1: {
      slidesPerView: 1,
      centeredSlides: true,
      loop: false
  },
  1200: {
      slidesPerView: 1.25,
      centeredSlides: true,
      loop: false
  },
  1300: {
      slidesPerView: 1.5,
      centeredSlides: true,
      loop: false
  },
  1500: {
      slidesPerView: 2,
      centeredSlides: false,
  },
}