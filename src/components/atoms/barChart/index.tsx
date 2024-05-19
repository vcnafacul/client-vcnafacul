import { Bar } from "react-chartjs-2";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  dataBar: {
    [x: string]: number;
  }[];
  labelHover: {
    [x: string]: object;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BarChart({ dataBar, labelHover }: Props) {
  const data = {
    labels: dataBar.map((d) => Object.keys(d)[0]),
    datasets: [
      {
        label: "Aproveitamento",
        labelColor: "rgba(255, 99, 132, 1)",
        data: dataBar.map((d) => Object.values(d)[0]),
        backgroundColor: [
          "#37D6B5",
          "#0F9B2C",
          "#FFE53C",
          "#FF7600",
          "#DA005A",
          "#E0E0E0",
          "#8cc408",
          "#fff4af",
        ],
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "white",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      x: {
        ticks: {
          color: "white",
          font: {
            size: 14,
            weight: "bold",
          },
          stepSize: 1,
          beginAtZero: true,
          maxRotation: 90,
          minRotation: 35,
        },
      },
    },
    legend: {
      labels: {
        fontColor: "blue",
        fontSize: 18,
      },
    },
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    hoverBackgroundColor: "rgba(255,255,255,0.9)",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            // const frentes =
            //   labelHover[context.label as keyof typeof labelHover];
            const labels = [];
            let label = "Aproveitamento: ";
            if (context.parsed.y !== null) {
              label += context.parsed.y + "%";
            }
            labels.push(label);
            // if (frentes) {
            //   label += "\n";
            //   Object.keys(frentes).map((f: string) => {
            //     labels.push(
            //       `${f}: ${(
            //         frentes[f as keyof typeof frentes] as number
            //   || 0).toFixed(2)}`
            //     );
            //   });
            // }
            return labels;
          },
        },
        titleMarginBottom: 10,
        padding: 15,
        boxHeight: 20,
        boxPadding: 10,
        bodyFont: { size: 14, lineHeight: 1.2 },
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Bar options={options as any} data={data} />;
}
