import { ReactComponent as Astronaut } from "../../assets/icons/materias/Astronaut.svg";
import { ReactComponent as Biology } from "../../assets/icons/materias/Biology.svg";
import { ReactComponent as Geo } from "../../assets/icons/materias/Geo.svg";
import { ReactComponent as Grammar } from "../../assets/icons/materias/Grammar.svg";
import { ReactComponent as History } from "../../assets/icons/materias/History.svg";
import { ReactComponent as LPT } from "../../assets/icons/materias/LPT.svg";
import { ReactComponent as Literature } from "../../assets/icons/materias/Literature.svg";
import { ReactComponent as Math } from "../../assets/icons/materias/Math.svg";
import { ReactComponent as Science } from "../../assets/icons/materias/Science.svg";
import { ReactComponent as TakingEarth } from "../../assets/icons/materias/TakingEarth.svg";
import { ReactComponent as Thoughts } from "../../assets/icons/materias/Thoughts.svg";
import { Materias } from "../../enums/content/materias";

export interface MateriaPage {
  image: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  id: Materias;
}

export interface DataMateriaProps {
    LinguaPortuguesa: MateriaPage;
}

export const dataMateria = {
  LinguaPortuguesa: {
    image: LPT,
    id: Materias.LinguaPortuguesa,
  },
  LinguaEstrangeira: {
    image: Grammar,
    id: Materias.LinguaEstrangeira,
  },
  Artes: {
    image: Literature,
    id: Materias.Artes,
  },
  Biologia: {
    image: Biology,
    id: Materias.Biologia,
  },
  Fisica: {
    image: Astronaut,
    id: Materias.Fisica,
  },
  Quimica: {
    image: Science,
    id: Materias.Quimica,
  },
  Matematica: {
    image: Math,
    id: Materias.Matematica,
  },
  Historia: {
    image: History,
    id: Materias.Historia,
  },
  Geografia: {
    image: Geo,
    id: Materias.Geografia,
  },
  Filosofia: {
    image: Thoughts,
    id: Materias.Filosofia,
  },
  Sociologia: {
    image: TakingEarth,
    id: Materias.Sociologia,
  },
  Atualidades: {
    image: TakingEarth,
    id: Materias.Atualidades,
  },
} as DataMateriaProps;
