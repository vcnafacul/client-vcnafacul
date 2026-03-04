import { ReactComponent as Artes } from "@/assets/icons/home-subjects-arte.svg";
import { ReactComponent as Atualidades } from "@/assets/icons/home-subjects-atualidades.svg";
import { ReactComponent as Biologia } from "@/assets/icons/home-subjects-biologia.svg";
import { ReactComponent as Espanhol } from "@/assets/icons/home-subjects-espanhol.svg";
import { ReactComponent as Filosofia } from "@/assets/icons/home-subjects-filosofia.svg";
import { ReactComponent as Fisica } from "@/assets/icons/home-subjects-fisica.svg";
import { ReactComponent as Geografia } from "@/assets/icons/home-subjects-geografia.svg";
import { ReactComponent as Gramatica } from "@/assets/icons/home-subjects-gramatica.svg";
import { ReactComponent as Historia } from "@/assets/icons/home-subjects-historia.svg";
import { ReactComponent as Ingles } from "@/assets/icons/home-subjects-ingles.svg";
import { ReactComponent as Leitura } from "@/assets/icons/home-subjects-leitura-prod-textos.svg";
import { ReactComponent as Literatura } from "@/assets/icons/home-subjects-literatura.svg";
import { ReactComponent as Matematica } from "@/assets/icons/home-subjects-matematica.svg";
import { ReactComponent as Quimica } from "@/assets/icons/home-subjects-quimica.svg";
import { ReactComponent as Sociologia } from "@/assets/icons/home-subjects-sociologia.svg";

import { ReactComponent as Astronaut } from "@/assets/icons/materias/Astronaut.svg";
import { ReactComponent as Biology } from "@/assets/icons/materias/Biology.svg";
import { ReactComponent as English } from "@/assets/icons/materias/English.svg";
import { ReactComponent as Geo } from "@/assets/icons/materias/Geo.svg";
import { ReactComponent as Grammar } from "@/assets/icons/materias/Grammar.svg";
import { ReactComponent as History } from "@/assets/icons/materias/History.svg";
import { ReactComponent as LPT } from "@/assets/icons/materias/LPT.svg";
import { ReactComponent as Languages } from "@/assets/icons/materias/Languages.svg";
import { ReactComponent as LiteratureImg } from "@/assets/icons/materias/Literature.svg";
import { ReactComponent as Math } from "@/assets/icons/materias/Math.svg";
import { ReactComponent as Science } from "@/assets/icons/materias/Science.svg";
import { ReactComponent as TakingEarth } from "@/assets/icons/materias/TakingEarth.svg";
import { ReactComponent as Thoughts } from "@/assets/icons/materias/Thoughts.svg";

import { FaBook } from "react-icons/fa";

type SvgComponent = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

/** Presets de ícone do menu lateral (home-subjects-*) */
export const iconPresets: Record<string, SvgComponent> = {
  biologia: Biologia,
  fisica: Fisica,
  quimica: Quimica,
  matematica: Matematica,
  historia: Historia,
  geografia: Geografia,
  filosofia: Filosofia,
  sociologia: Sociologia,
  atualidades: Atualidades,
  gramatica: Gramatica,
  ingles: Ingles,
  artes: Artes,
  espanhol: Espanhol,
  literatura: Literatura,
  leitura: Leitura,
};

/** Presets de imagem da página de matéria (materias/*) */
export const imagePresets: Record<string, SvgComponent> = {
  Astronaut,
  Biology,
  Geo,
  Grammar,
  History,
  LPT,
  Literature: LiteratureImg,
  Math,
  Science,
  TakingEarth,
  Thoughts,
  English,
  Languages,
};

export function getIconPreset(key?: string): SvgComponent {
  if (key && iconPresets[key]) return iconPresets[key];
  return FaBook as unknown as SvgComponent;
}

export function getImagePreset(
  key?: string,
): SvgComponent | undefined {
  if (key && imagePresets[key]) return imagePresets[key];
  return undefined;
}
