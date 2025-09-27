import { Box, Typography } from "@mui/material";
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
  width?: string | number;
  height?: string | number;
}

export default function LineChartMui({
  xAxis,
  series,
  title,
  width = "100%",
  height = 400,
}: LineChartMuiProps) {
  return (
    <Box sx={{ width, height, display: "flex", flexDirection: "column" }}>
      {title && (
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>
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
          series={series.map((s) => ({
            ...s,
            curve: "bumpX",
            showMark: false,
          }))}
          width={undefined}
          height={undefined}
          grid={{ horizontal: true }}
          slotProps={{
            legend: { position: { vertical: "top" } },
          }}
        />
      </Box>
    </Box>
  );
}
