/**
 * Cor de identidade de cada área do ENEM (tickets/059 R26): matiz categórico
 * fixo `chart-N`, nunca token de status. Linguagens 1, Matemática 2,
 * Natureza 3, Humanas 4. Só vai em fundo de ícone (acento sem texto); o
 * rótulo continua `text-foreground`.
 */
export const getColorEnemArea = (area: string) => {
  switch (area) {
    case "Ciências Humanas":
      return "bg-chart-4";
    case "Ciências da Natureza":
      return "bg-chart-3";
    case "Matemática":
      return "bg-chart-2";
    case "Linguagens":
      return "bg-chart-1";
    default:
      return "bg-primary";
  }
};

export const getTextColorEnemArea = (_area: string) => "text-foreground";
