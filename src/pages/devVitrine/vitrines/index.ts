import { Vitrine } from "../tipos";
import {
  vitrineAnulacaoNaProva,
  vitrineAvisoAnulada,
  vitrineAvisoDeRecalculo,
  vitrineCadernoComAnuladas,
  vitrineModalAnular,
  vitrineQuestaoAnuladaNoSimulado,
} from "./anulacao";
import { vitrineChamada } from "./chamada";

/** Para pôr um componente na vitrine: criar o arquivo nesta pasta e listar aqui. */
export const vitrines: Vitrine[] = [
  vitrineChamada,
  vitrineModalAnular,
  vitrineAnulacaoNaProva,
  vitrineAvisoAnulada,
  vitrineCadernoComAnuladas,
  vitrineQuestaoAnuladaNoSimulado,
  vitrineAvisoDeRecalculo,
];
