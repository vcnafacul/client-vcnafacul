import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { Chip, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { useEffect, useMemo, useState } from "react";
import { BarChartMuiProps } from "../barChartMui";
import { palette } from "@/lib/palette";

export interface BarChartWithFilterProps extends BarChartMuiProps {
  title?: string;
}

const COLORS = [
  palette.marine[900],
  palette.mint[700],
  palette.orange[500],
  palette.red[500],
  palette.pink[600],
  palette.blue[400],
  palette.marine[500],
  palette.mint[400],
  palette.yellow[300],
  palette.orange[400],
];

const TOP_N = 8;

export default function BarChartWithFilter({
  data,
  title,
}: BarChartWithFilterProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setHidden(new Set());
    setShowAll(false);
  }, [data]);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data]
  );

  const handleToggle = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleData = sorted.filter((d) => !hidden.has(d.id));
  const displayData = showAll ? visibleData : visibleData.slice(0, TOP_N);
  const hasMore = visibleData.length > TOP_N;

  const longestLabel = displayData.reduce(
    (max, d) => Math.max(max, d.label.length),
    0
  );
  // No celular a margem dos rótulos (até 220px) deixava as barras com ~70px.
  const acimaDeSm = useAcimaDeSm();
  const leftMargin = Math.min(
    acimaDeSm ? 220 : 120,
    Math.max(acimaDeSm ? 100 : 80, longestLabel * 7.5),
  );

  return (
    <div>
      {title && (
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
      )}

      {/* Chips toggle — scrollable single row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-thin flex-wrap">
        {sorted.map((item, i) => {
          const isHidden = hidden.has(item.id);
          const chipColor = COLORS[i % COLORS.length];
          return (
            <Chip
              key={item.id}
              label={item.label}
              size="small"
              onClick={() => handleToggle(item.id)}
              sx={{
                flexShrink: 0,
                backgroundColor: isHidden ? "transparent" : chipColor,
                color: isHidden ? chipColor : "white",
                border: `1.5px solid ${chipColor}`,
                fontWeight: 600,
                fontSize: "0.7rem",
                opacity: isHidden ? 0.5 : 1,
                "&:hover": {
                  backgroundColor: isHidden ? `${chipColor}18` : chipColor,
                },
              }}
            />
          );
        })}
      </div>

      {/* Horizontal bar chart — linear scale */}
      {displayData.length > 0 && (
        <BarChart
          layout="horizontal"
          yAxis={[
            {
              scaleType: "band",
              data: displayData.map((item) => item.label),
            },
          ]}
          xAxis={[
            {
              scaleType: "linear",
            },
          ]}
          series={[
            {
              data: displayData.map((item) => item.value),
              label: "Total",
              valueFormatter: (v) =>
                v !== null ? v.toLocaleString("pt-BR") : "",
            },
          ]}
          height={Math.max(180, displayData.length * 40 + 40)}
          margin={{ left: leftMargin, right: 10, top: 10, bottom: 30 }}
          slotProps={{ legend: { hidden: true } }}
          colors={[COLORS[0]]}
        />
      )}

      {/* Show more / less */}
      {hasMore && (
        <button
          type="button"
          className="text-xs text-foreground underline mt-1 hover:text-primary"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? "Mostrar menos"
            : `Mostrar todos (${visibleData.length})`}
        </button>
      )}
    </div>
  );
}
