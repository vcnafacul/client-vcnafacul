import { ResponsivePie } from "@nivo/pie";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export function PieChart({ data }: Props) {
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 20, right: 0, bottom: 10, left: 0 }}
      innerRadius={0.7}
      padAngle={1}
      cornerRadius={5}
      activeOuterRadiusOffset={5}
      colors={{ scheme: "blues" }}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 3]],
      }}
      arcLinkLabelsSkipAngle={1}
      arcLinkLabelsTextColor="#FFF"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={1}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
    />
  );
}
