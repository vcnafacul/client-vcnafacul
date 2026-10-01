import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";

interface Props {
  data: {
    id: string;
    value: number;
    label: string;
  }[];
  width?: number;
}

/** Largura do gráfico no celular — a área útil em 375px fica em ~310px. */
const LARGURA_NO_CELULAR = 300;

export function PieChartMui({ data, width = 400 }: Props) {
  /*
    ⚠️ Abaixo de 768px a largura fixa (400px, com a legenda à direita) passava
    da tela. No celular: largura da tela e legenda embaixo, em duas colunas —
    a altura cresce com o número de itens para a legenda caber.
  */
  const acimaDeSm = useAcimaDeSm();
  const linhasDaLegenda = Math.ceil(data.length / 2);
  const celular = acimaDeSm
    ? null
    : {
        width: Math.min(width, LARGURA_NO_CELULAR),
        legenda: linhasDaLegenda * 24 + 12,
      };
  const colors = [
    "#5DADE2", // Azul Claro
    "#48C9B0", // Verde Água
    "#45B39D", // Verde Turquesa
    "#52BE80", // Verde Pastel
    "#58D68D", // Verde Menta
    "#A9DFBF", // Verde Suave
    "#F9E79F", // Amarelo Pastel
    "#F7DC6F", // Amarelo Claro
    "#F8C471", // Laranja Claro
    "#F5B041", // Laranja Amarelado
    "#EB984E", // Laranja Pastel
    "#D35400", // Laranja Profundo
    "#BA4A00", // Laranja Escuro
    "#F43535", // Vermelho Claro
  ];
  return (
    <PieChart
      series={[
        {
          data: data,
          innerRadius: 10,
          outerRadius: celular ? 90 : 100,
          paddingAngle: 1,
          cornerRadius: 3,
          cx: celular ? celular.width / 2 : 150,
          cy: celular ? 110 : 150,
          arcLabelMinAngle: 20,
          arcLabelRadius: "40%",
          arcLabel: (item) => `${item.value}`,
        },
      ]}
      colors={colors}
      width={celular ? celular.width : width}
      {...(celular && {
        height: 220 + celular.legenda,
        margin: { top: 10, left: 10, right: 10, bottom: celular.legenda },
        slotProps: {
          legend: {
            direction: "row" as const,
            position: { vertical: "bottom" as const, horizontal: "middle" as const },
            padding: 0,
            itemMarkWidth: 10,
            itemMarkHeight: 10,
            labelStyle: { fontSize: 12 },
          },
        },
      })}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fontWeight: "bold",
          fill: "white",
          fontSize: 12,
        },
      }}
    />
  );
}
