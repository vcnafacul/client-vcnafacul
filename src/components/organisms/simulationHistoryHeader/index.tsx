import { useEffect, useState } from "react";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import { FieldValueSimulationHistoryHeader as FieldValue } from "../../atoms/fieldValueSimulationHistoryHeader";
import { PieChart } from "../../atoms/pieChart";
import { RadarChart } from "../../atoms/radarChart";
import Text from "../../atoms/text";
import Button from "../../molecules/button";

interface SimulationHistoryHeaderProps {
  historic: HistoricoDTO;
}

export function SimulationHistoryHeader({
  historic,
}: SimulationHistoryHeaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataPie, setDataPie] = useState<any[]>([]);
  const finished =
    historic.simulado.tipo.quantidadeTotalQuestao ===
    historic.questoesRespondidas;

  const data = historic.aproveitamento.materias.map((m) => ({
    materia: m.nome,
    aproveitamento: parseFloat((m.aproveitamento * 100).toFixed(0)),
    frentes: m.frentes.map((f) => ({
      name: f.nome,
    })),
  }));

  const acertos = [
    {
      id: "Acertos",
      value: historic.respostas.filter(
        (r) => r.alternativaCorreta === r.alternativaEstudante
      ).length,
    },
    {
      id: "Erradas",
      value: historic.respostas.filter(
        (r) =>
          r.alternativaEstudante !== undefined &&
          r.alternativaCorreta !== r.alternativaEstudante
      ).length,
    },
    {
      id: "Não Respondidas",
      value: historic.respostas.filter(
        (r) => r.alternativaEstudante === undefined
      ).length,
    },
  ];

  useEffect(() => {
    if (dataPie.length === 0) {
      setDataPie(acertos);
    }
  }, []);

  return (
    <div className="my-6 h-full overflow-x-hidden">
      <div className="flex items-center justify-around my-4 ">
        <Text className="text-white w-fit m-0">Simulado do Enem</Text>
        <div>
          <Button className="w-24" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row px-2 w-full h-full items-center sm:items-start md:items-center">
        <div className="flex items-start justify-center flex-col w-full h-full sm:mt-14 md:mt-0">
          <div className="flex flex-col items-start gap-1 whitespace-nowrap flex-wrap ml-4">
            <FieldValue field="Caderno" value={historic.simulado.tipo.nome} />
            <FieldValue field="Ano" value={`${historic.ano}`} />
            <FieldValue
              field="Quantidade"
              value={`${historic.simulado.tipo.quantidadeTotalQuestao} questões`}
            />
            <FieldValue
              field="Tempo"
              value={getFormatingTime(historic.tempoRealizado)}
            />
            <div className="text-white flex gap-1 text-lg items-center">
              <span>Status</span>
              <span>{finished ? "Completo" : "Incompleto"}</span>
              <span>
                {getStatusIcon(
                  finished ? StatusEnum.Approved : StatusEnum.Rejected
                )}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-white text-xl py-4 font-black flex justify-center items-center select-none">
            Aproveitamento Geral{" "}
            {(historic.aproveitamento.geral * 100).toFixed(0)}%
          </h1>
          <div className="flex flex-col md:flex-row ">
            <div className="flex justify-center pl-4 py-2 h-80 sm:h-72 md:min-w-[370px]">
              <RadarChart data={data} />
            </div>
            <div className="p-2 h-60 min-w-[400px]">
              <PieChart data={dataPie} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
