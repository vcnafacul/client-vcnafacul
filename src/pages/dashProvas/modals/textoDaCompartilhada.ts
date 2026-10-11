/** tickets/038 — o que a categoria compartilhada cria. */
export const textoDaCompartilhada = (nome: string) =>
  nome.includes("Dia 1")
    ? "ENEM Dia 1 do cursinho — nome livre, PDF opcional. Cria 2 simulados: um com as questões 1–5 de Inglês e outro com as de Espanhol."
    : "ENEM Dia 2 do cursinho — nome livre, PDF opcional. Cria 1 simulado, com as questões de 91 a 180.";
