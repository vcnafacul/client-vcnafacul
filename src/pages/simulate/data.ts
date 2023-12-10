import { Alternatives } from "../../types/question/alternative"

export const simulateData = {
    baseTitle: 'Simulado do',
    alternativeText: 'Selecione uma resposta',
    alternativasData: Alternatives,
     legends: [
        { label: "Questão atual", className: "bg-orange border border-orange"},
        { label: "Questão pulada", className: "bg-lightYellow border border-marine"},
        { label: "Questão respondida", className: "bg-white border border-marine"},
        { label: "Questão não visualizada", className: "bg-lightGray border border-grey"},
     ]
}

export const radios = {
   question: {
      first: 'Sim',
      second: 'Não, foi um problema na plataforma'
   },
   platform: {
      first: 'Bug recorrente',
      second: 'Bug esporádico'
   }
}