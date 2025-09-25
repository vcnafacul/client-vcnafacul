import { BarChart } from "@mui/x-charts/BarChart";

export interface BarChartMuiProps {
  data: {
    id: string;
    value: number;
    label: string;
  }[];
  color?: string;
}

export default function BarChartMui({
  data,
  color = "#F43535",
}: BarChartMuiProps) {
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
        },
      }}
      colors={[color]}
    />
  );
}
