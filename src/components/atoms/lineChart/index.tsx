import { ResponsiveLine } from "@nivo/line";

interface Props {
  data: {
    id: string;
    data: {
      color: string;
      x: string;
      y: number;
    }[];
  }[];
  legendX: string;
  legendY: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MyResponsiveLine({ data, legendX, legendY }: Props) {
  return (
      <ResponsiveLine
        data={data}
        margin={{ top: 10, right: 10, bottom: 60, left: 90 }}
        xScale={{ type: "point" }}
        colors={[
          'rgb(97, 205, 187)',
          'rgb(244, 117, 96)'
        ]}
        crosshairType="cross"
        curve="monotoneX"
        yScale={{
          type: "linear",
          min: 0,
          max: 100,
          stacked: true,
        }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 15,
          tickRotation: -25,
          legend: !legendX ? null : !legendX,
          legendOffset: 36,
          legendPosition: "middle",
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 7,
          tickRotation: -2,
          legend: !legendY ? null : legendY,
          legendOffset: -50,
          legendPosition: "middle",
          truncateTickAt: 0,
        }}
        pointSize={5}
        pointColor={{ theme: "background" }}
        pointBorderWidth={4}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="data.yFormatted"
        pointLabelYOffset={-12}
        enableTouchCrosshair={true}
        useMesh={true}
      />
  );
}
