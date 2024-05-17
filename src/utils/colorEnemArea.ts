export const getColorEnemArea = (area: string) => {
  console.log(area);
  switch (area) {
    case "Ciências Humanas":
      return "green3";
    case "Ciências da Natureza":
      return "pink";
    case "Matemática":
      return "orange";
    default:
      return "marine";
  }
};
