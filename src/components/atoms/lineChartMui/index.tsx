import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts";

interface LineSeries {
  label: string;
  data: number[];
  color?: string;
}

export interface LineChartMuiProps {
  xAxis: string[];
  series: LineSeries[];
  title?: string;
}

export default function LineChartMui({
  xAxis,
  series,
  title,
}: LineChartMuiProps) {
  const theme = useTheme();
  return (
    <>
      {title && (
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
      )}
      <LineChart
        xAxis={[{ data: xAxis, scaleType: "band", label: "Período" }]}
        margin={{
          left: 80, // Increase this value as needed
          right: 40,
          top: 60,
          bottom: 40,
        }}
        yAxis={[
          {
            label: "Quantidade",
            labelStyle: {
              translate: -15,
            },
          },
        ]}
        series={series.map((s, i) => ({
          ...s,
          curve: "monotoneX",
          showMark: false,
          color:
            s.color ??
            theme.palette[i % 2 === 0 ? "primary" : "secondary"].main,
        }))}
        height={400}
        grid={{ horizontal: true }}
        slotProps={{
          legend: { position: { vertical: "top", horizontal: "middle" } },
        }}
      />
    </>
  );
}
