export const simulateData = {
    baseTitle: 'Simulado do',
    alternativeText: 'Selecione uma resposta',
     legends: [
        { label: "Questão atual", className: "bg-cta border border-cta"},
        { label: "Questão pulada", className: "bg-warning-muted border border-primary"},
        { label: "Questão respondida", className: "bg-white border border-primary"},
        { label: "Questão não visualizada", className: "bg-muted border border-input"},
        // tickets/042 (D5)
        { label: "Questão anulada", className: "bg-white border border-destructive"},
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