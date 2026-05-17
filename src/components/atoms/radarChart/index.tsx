import { ResponsiveRadar } from "@nivo/radar";

interface Props {
  data: Record<string, string | number>[];
  keys?: string[];
  indexBy?: string;
  scheme?: string;
  colors?: string[];
  gridShape?: string;
  fill?: string;
  dotSize?: number;
  dotBorderWidth?: number;
  maxValue?: number;
}

export function RadarChart({
  data,
  keys = ["aproveitamento"],
  indexBy = "materia",
  scheme,
  colors,
  gridShape,
  fill,
  dotSize = 5,
  dotBorderWidth = 3,
  maxValue = 100,
}: Props) {
  const shape: string = gridShape || "linear";
  // Cor explícita > scheme > roxo claro padrão (visível em fundos claros e escuros)
  const colorProp = colors
    ? colors
    : scheme
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ scheme: scheme as any } as any)
      : ["#a78bfa"];
  return (
    <ResponsiveRadar
      data={data}
      keys={keys}
      indexBy={indexBy}
      margin={{ top: 25, right: 0, bottom: 25, left: 0 }}
      borderColor={{ from: "color", modifiers: [] }}
      gridLabelOffset={10}
      maxValue={maxValue}
      gridLevels={10}
      dotSize={dotSize}
      dotColor={{ theme: "background" }}
      dotBorderWidth={dotBorderWidth}
      colors={colorProp}
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
