import { ResponsiveRadar } from "@nivo/radar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RadarChart = ({ data }: any) => (
  <ResponsiveRadar
    data={data}
    keys={["aproveitamento"]}
    indexBy="materia"
    margin={{ top: 40, right: 60, bottom: 40, left: 0 }}
    borderColor={{ from: "color", modifiers: [] }}
    gridLabelOffset={10}
    maxValue={100}
    gridLevels={10}
    dotSize={5}
    dotColor={{ theme: "background" }}
    dotBorderWidth={3}
    colors={{ scheme: "blues" }}
    fillOpacity={0.5}
    gridShape="linear"
    theme={{
      axis: {
        ticks: {
          text: {
            fontSize: 12,
            fill: "#fff",
          },
        },
      },
    }}
  />
);
