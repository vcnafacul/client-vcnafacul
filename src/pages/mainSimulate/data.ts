import  { ReactComponent as Linguagens } from "../../assets/images/dashboard/linguagens.svg";
import  { ReactComponent as BioExatas } from "../../assets/images/dashboard/bioexatas.svg";
import  { ReactComponent as Humanas } from "../../assets/images/dashboard/humanas.svg";
import  { ReactComponent as Matematica } from "../../assets/images/dashboard/matematica.svg";
import { SimuladoDefaultEnum } from "../../enums/simulado/simuladoDefaultEnum";

const textLinguagens = "Esta prova contêm questões da área Linguagem, Código e suas Tecnologias"
const textBioExatas = "Esta prova contêm questões da área Ciência da Natureza e suas Tecnologias"
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

export const simulateData = {
    titleBook: 'Simulado por Caderno',
    subTitleBook: 'Realize um simulado mais rapido contento apenas 45 questões de um das áreas do conhecimentro do ENEM.',
    simulateCardsBook : [
        {id: 1, tipo: SimuladoDefaultEnum.Linguagens, title: "Linguagens", subTitle: textLinguagens,  icon: Linguagens, className: 'border-marine', color: 'bg-marine'},
        {id: 2, tipo: SimuladoDefaultEnum.BioExatas, title: "Ciências da Natureza", subTitle: textBioExatas, icon: BioExatas, className: 'border-pink', color: 'bg-pink'},
        {id: 3, tipo: SimuladoDefaultEnum.Humanas, title: "Ciência Humanas", subTitle: textHumanas, icon: Humanas, className: 'border-green', color: 'bg-green'},
        {id: 4, tipo: SimuladoDefaultEnum.Matematica, title: "Matemática", subTitle: textMatematica, icon: Matematica, className: 'border-red', color: 'bg-red'}
    ],
    titleDay: 'Simulado por Dia',
    subTitleDay: 'Realize um simulado contendo 90 questões assim como cada um dos dias do ENEM.',
    simulateCardsDay : [
        {id: 5, tipo: SimuladoDefaultEnum.Enem1, title: "Enem dia #1", item: itemsEnem1, icon: Linguagens, className: 'border-orange', color: 'bg-orange'},
        {id: 6, tipo: SimuladoDefaultEnum.Enem2, title: "Enem dia #2", item: itemsEnem2, icon: BioExatas, className: 'border-orange', color: 'bg-orange'}
    ],
}

export const getTitle = (type: SimuladoDefaultEnum) => {
  switch (type) {
    case SimuladoDefaultEnum.Linguagens:
      return "Linguagens"
    case SimuladoDefaultEnum.Humanas:
      return "Ciências da Natureza"
    case SimuladoDefaultEnum.BioExatas:
      return "Ciência Humanas"
    case SimuladoDefaultEnum.Matematica:
      return "Matemática"
    case SimuladoDefaultEnum.Enem1:
      return "Enem dia #1"
      case SimuladoDefaultEnum.Enem2:
        return "Enem dia #2"
    default:
      return ""
  }
}

export const getIconByTitle = (title: string) => {
  switch (title) {
    case "Linguagens":
      return Linguagens
    case "Ciências da Natureza":
      return BioExatas
    case "Ciência Humanas":
      return Humanas
    case "Matemática":
      return Matematica
    default:
      return ""
  }
}