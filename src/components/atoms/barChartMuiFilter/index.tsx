import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import { BarChartMuiProps } from "../barChartMui";

export interface BarChartWithFilterProps extends BarChartMuiProps {
  title?: string;
}

export default function BarChartWithFilter({
  data,
  title,
}: BarChartWithFilterProps) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      setVisible(data.map((d) => d.id));
    }
  }, [data]);

  const handleToggle = (id: string) => {
    setVisible((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const filteredData = data.filter((d) => visible.includes(d.id));

  return (
    <div>
      {title && (
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
      )}
      {/* Checkboxes */}
      <FormGroup row>
        {data.map((item) => (
          <FormControlLabel
            key={item.id}
            control={
              <Checkbox
                checked={visible.includes(item.id)}
                onChange={() => handleToggle(item.id)}
              />
            }
            label={item.label}
          />
        ))}
      </FormGroup>

      {/* Gráfico */}
      <BarChart
        xAxis={[
          {
            scaleType: "band",
            data: filteredData.map((item) => item.label),
            tickLabelStyle: { angle: -15, textAnchor: "end" },
          },
        ]}
        series={[
          {
            data: filteredData.map((item) => item.value),
            label: "Valores",
          },
        ]}
        height={400}
        slotProps={{ legend: { hidden: true } }}
        colors={["#F43535"]}
      />
    </div>
  );
}
