import { Prova } from "../../dtos/prova/prova";
import { ObjDefault } from "../../dtos/question/QuestionDTO";

export interface InfoQuestion {
    frentes: ObjDefault[];
    materias: ObjDefault[];
    provas: Prova[];
}