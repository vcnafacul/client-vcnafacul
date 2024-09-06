import { ResponsiveRadar } from "@nivo/radar";

interface Props {
  data: {
    materia: string;
    aproveitamento: number;
  }[];
  scheme?: string;
  gridShape?: string;
  fill?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RadarChart({ data, scheme, gridShape, fill }: Props) {
  const colorScheme = scheme || "blues";
  const shape: string = gridShape || "linear";
  return (
    <ResponsiveRadar
      data={data}
      keys={["aproveitamento"]}
      indexBy="materia"
      margin={{ top: 25, right: 0, bottom: 25, left: 0 }}
      borderColor={{ from: "color", modifiers: [] }}
      gridLabelOffset={10}
      maxValue={100}
      gridLevels={10}
      dotSize={5}
      dotColor={{ theme: "background" }}
      dotBorderWidth={3}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      colors={{ scheme: colorScheme as any }}
      fillOpacity={0.5}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gridShape={shape as any}
      rotation={-30}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 10,
              fill: fill || "#fff",
            },
          },
        },
      }}
    />
  );
}
