import { Prova } from "../../dtos/prova/prova";
import {
  FrenteObjDefault,
  MateriaObjDefault,
  ObjDefault,
} from "../../dtos/question/questionDTO";

export interface InfoQuestion {
  frentes: FrenteObjDefault[];
  materias: MateriaObjDefault[];
  exames: ObjDefault[];
  provas: Prova[];
}
