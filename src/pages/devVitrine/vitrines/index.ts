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
import { vitrineFiltroDoBanco } from "./filtroDoBanco";
import { vitrineMonitoramentoCabecalho } from "./monitoramento";
import { vitrineMonitoramentoSecoes } from "./monitoramentoSecoes";
import { vitrineUltimosProcessos } from "./ultimosProcessos";
import { vitrineIndicadoresAdmin } from "./indicadores";
import { vitrineColaboradores } from "./colaboradores";
import { vitrineMeuPerfil } from "./meuPerfil";
import { vitrineResultadoComAnulada } from "./resultadoComAnulada";
import { vitrineDemanda } from "./demandas";

/** Para pôr um componente na vitrine: criar o arquivo nesta pasta e listar aqui. */
export const vitrines: Vitrine[] = [
  vitrineChamada,
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
  vitrineDemanda,
];
