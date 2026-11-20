export const getColorEnemArea = (area: string) => {
  switch (area) {
    case "Ciências Humanas":
      return "bg-success";
    case "Ciências da Natureza":
      return "bg-info";
    case "Matemática":
      return "bg-cta";
    default:
      return "bg-primary";
  }
};

export const getTextColorEnemArea = (area: string) => {
  switch (area) {
    case "Ciências Humanas":
      return "text-success";
    case "Ciências da Natureza":
      return "text-info";
    case "Matemática":
      return "text-foreground";
    default:
      return "text-foreground";
  }
};
