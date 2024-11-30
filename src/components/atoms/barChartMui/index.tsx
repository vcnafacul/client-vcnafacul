import { BarChart } from "@mui/x-charts/BarChart";

interface Props {
  data: {
    id: string;
    value: number;
    label: string;
  }[];
  color?: string
}

export default function BarChartMui({ data, color = "#48C9B0" }: Props) {

  return (
    <BarChart
      xAxis={[
        {
          scaleType: "band",
          data: data.map((item) => item.label), // Mostra labels no eixo X
        },
      ]}
      series={[
        {
          data: data.map((item) => item.value), // Valores da série
          label: "Valores", // Rótulo da série
        },
      ]}
      height={400}
      slotProps={{
        legend: {
          hidden: true,
        }
      }}
      colors={[color]}
    />
  );
}
