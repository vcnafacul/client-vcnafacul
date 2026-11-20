import { Alternatives } from "../../types/question/alternative";

export const simulateMetricData = {
     legends: [
        { label: "Questão atual", className: "bg-cta border border-cta"},
        { label: "Questão respondida", className: "bg-white border border-primary"},
        { label: "Questão certas", className: "border border-primary bg-success rotate-45"},
        { label: "Questão não visualizada", className: "bg-muted border border-input"},
        // tickets/042
        { label: "Questão anulada", className: "bg-white border border-destructive"},
     ],
     alternativasData: Alternatives,
}