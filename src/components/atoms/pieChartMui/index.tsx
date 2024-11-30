import { pieArcLabelClasses, PieChart } from "@mui/x-charts";

interface Props {
  data: {
    id: string;
    value: number;
    label: string;
  }[];
  width?: number;
}

export function PieChartMui({ data, width = 400 }: Props) {
  const colors = [
    "#5DADE2", // Azul Claro
    "#48C9B0", // Verde Água
    "#45B39D", // Verde Turquesa
    "#52BE80", // Verde Pastel
    "#58D68D", // Verde Menta
    "#A9DFBF", // Verde Suave
    "#F9E79F", // Amarelo Pastel
    "#F7DC6F", // Amarelo Claro
    "#F8C471", // Laranja Claro
    "#F5B041", // Laranja Amarelado
    "#EB984E", // Laranja Pastel
    "#D35400", // Laranja Profundo
    "#BA4A00", // Laranja Escuro
  ];
  return (
    <PieChart
      series={[
        {
          data: data,
          innerRadius: 10,
          outerRadius: 100,
          paddingAngle: 1,
          cornerRadius: 3,
          cx: 150,
          cy: 150,
          arcLabelMinAngle: 20,
          arcLabelRadius: "40%",
          arcLabel: (item) => `${item.value}`,
        },
      ]}
      colors={colors}
      width={width}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fontWeight: "bold",
          fill: "white",
          fontSize: 12,
        },
      }}
    />
  );
}
