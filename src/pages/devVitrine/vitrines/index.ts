import { Vitrine } from "../tipos";
import {
  vitrineAnulacaoNaProva,
  vitrineAvisoAnulada,
  vitrineAvisoDeRecalculo,
  vitrineCadernoComAnuladas,
  vitrineModalAnular,
  vitrineQuestaoAnuladaNoSimulado,
} from "./anulacao";
import { vitrineAbaClassificacao } from "./abaClassificacao";
import { vitrineChamada } from "./chamada";
import { vitrineHistoricoDeChamadas } from "./historicoDeChamadas";
import { vitrineFiltroDoBanco } from "./filtroDoBanco";
import { vitrineMonitoramentoCabecalho } from "./monitoramento";
import { vitrineMonitoramentoSecoes } from "./monitoramentoSecoes";
import { vitrineUltimosProcessos } from "./ultimosProcessos";
import { vitrineIndicadoresAdmin } from "./indicadores";
import { vitrineColaboradores } from "./colaboradores";
import { vitrineMeuPerfil } from "./meuPerfil";
import { vitrineResultadoComAnulada } from "./resultadoComAnulada";
import { vitrineDemandaModal } from "./demandaModal";

/** Para pôr um componente na vitrine: criar o arquivo nesta pasta e listar aqui. */
export const vitrines: Vitrine[] = [
  vitrineChamada,
  vitrineHistoricoDeChamadas,
  vitrineModalAnular,
  vitrineAnulacaoNaProva,
  vitrineAvisoAnulada,
  vitrineCadernoComAnuladas,
  vitrineQuestaoAnuladaNoSimulado,
  vitrineAvisoDeRecalculo,
  vitrineResultadoComAnulada,
  vitrineAbaClassificacao,
  vitrineFiltroDoBanco,
  vitrineMonitoramentoCabecalho,
  vitrineMonitoramentoSecoes,
  vitrineUltimosProcessos,
  vitrineIndicadoresAdmin,
  vitrineColaboradores,
  vitrineMeuPerfil,
  vitrineDemandaModal,
];
