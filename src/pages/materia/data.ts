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

export interface MateriaPage {
  image: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
}

export type DataMateriaProps = Record<string, MateriaPage>;

// Indexado por slug (usado no fallback) e por nome da matéria (para resolver pelo nome da API)
export const dataMateria: DataMateriaProps = {
  LinguaPortuguesa: { image: LPT, label: "Língua Portuguesa" },
  "Língua Portuguesa": { image: LPT, label: "Língua Portuguesa" },
  LinguaEstrangeira: { image: Grammar, label: "Língua Estrangeira" },
  "Língua Estrangeira": { image: Grammar, label: "Língua Estrangeira" },
  Artes: { image: Literature, label: "Artes" },
  Biologia: { image: Biology, label: "Biologia" },
  Fisica: { image: Astronaut, label: "Física" },
  Física: { image: Astronaut, label: "Física" },
  Quimica: { image: Science, label: "Quimica" },
  Química: { image: Science, label: "Química" },
  Matematica: { image: Math, label: "Matemática" },
  Matemática: { image: Math, label: "Matemática" },
  Historia: { image: History, label: "História" },
  História: { image: History, label: "História" },
  Geografia: { image: Geo, label: "Geografia" },
  Filosofia: { image: Thoughts, label: "Filosofia" },
  Sociologia: { image: TakingEarth, label: "Sociologia" },
  Atualidades: { image: TakingEarth, label: "Atualidades" },
};
