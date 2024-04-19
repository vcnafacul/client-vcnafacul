import { Prova } from "../../dtos/prova/prova";
import { FrenteObjDefault, ObjDefault } from "../../dtos/question/questionDTO";

export interface InfoQuestion {
  frentes: FrenteObjDefault[];
  materias: ObjDefault[];
  exames: ObjDefault[];
  provas: Prova[];
}
