import { ReactNode } from "react";
import { RotaFalsa } from "./fetchFalso";

export type EstadoDaVitrine = {
  /** Vai na URL: `/dev/vitrine/<componente>/<estado>`. */
  slug: string;
  titulo: string;
  rotas?: RotaFalsa[];
  render: () => ReactNode;
};

export type Vitrine = {
  slug: string;
  titulo: string;
  /** Onde o componente mora — para achar o código a partir do print. */
  arquivo: string;
  estados: EstadoDaVitrine[];
};
