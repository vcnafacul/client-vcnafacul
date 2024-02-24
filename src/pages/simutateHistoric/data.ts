import { Alternatives } from "../../types/question/alternative";

export const simulateMetricData = {
     legends: [
        { label: "Questão atual", className: "bg-orange border border-orange"},
        { label: "Questão respondida", className: "bg-white border border-marine"},
        { label: "Questão certas", className: "border border-marine bg-right-gradient rotate-45"},
        { label: "Questão não visualizada", className: "bg-lightGray border border-grey"},
     ],
     alternativasData: Alternatives,
}