import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";

const DEFAULT_COLORS = [
  "#02B2AF",
  "#2E96FF",
  "#B800D8",
  "#60009B",
  "#2731C8",
  "#03008D",
  "#F43535",
  "#FF7600",
  "#0F9B2C",
];

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
    <Box sx={{ width, display: "flex", flexDirection: "column" }}>
      {title && (
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
      )}
      <Box sx={{ height, minHeight: 0 }}>
        <LineChart
          xAxis={[{ data: xAxis, scaleType: "band", label: "Período" }]}
          margin={{
            left: 80,
            right: 40,
            top: 20,
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
            curve: "linear",
            showMark: false,
          }))}
          width={undefined}
          height={undefined}
          grid={{ horizontal: true }}
          slotProps={{
            legend: { hidden: true },
          }}
        />
      </Box>
      {/* Custom legend outside the SVG */}
      {series.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
          {series.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{
                  backgroundColor:
                    s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                }}
              />
              <span className="text-xs text-grey">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
}
