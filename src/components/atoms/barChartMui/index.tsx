import { BarChart } from "@mui/x-charts/BarChart";
import { palette } from "@/lib/palette";

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
  color = palette.red[500],
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
