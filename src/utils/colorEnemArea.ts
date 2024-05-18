export const getColorEnemArea = (area: string) => {
  switch (area) {
    case "Ciências Humanas":
      return "bg-green3";
    case "Ciências da Natureza":
      return "bg-pink";
    case "Matemática":
      return "bg-orange";
    default:
      return "bg-marine";
  }
};

export const getTextColorEnemArea = (area: string) => {
  switch (area) {
    case "Ciências Humanas":
      return "text-green3";
    case "Ciências da Natureza":
      return "text-pink";
    case "Matemática":
      return "text-orange";
    default:
      return "text-marine";
  }
};
