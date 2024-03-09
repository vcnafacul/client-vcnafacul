import { Prova } from "../../dtos/prova/prova";
import { ObjDefault } from "../../dtos/question/questionDTO";

export interface InfoQuestion {
    frentes: ObjDefault[];
    materias: ObjDefault[];
    exames: ObjDefault[];
    provas: Prova[];
}