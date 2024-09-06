import { ResponsiveSunburst } from "@nivo/sunburst";

export interface DataSun {
  name: string;
  color?: string;
  children?: DataSun[];
  part?: number;
  aproveitamento?: number;
}

interface Props {
  data: DataSun;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SunBurstChart({ data }: Props) {
  return (
    <ResponsiveSunburst
      data={data}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      id="name"
      value="part"
      cornerRadius={2}
      borderColor={{ theme: "background" }}
      colors={{ scheme: "paired" }}
      childColor={{
        from: "color",
        modifiers: [["darker", 0.4]],
      }}
      enableArcLabels={true}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor="#fff"
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
}
