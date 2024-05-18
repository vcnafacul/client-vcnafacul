import { QuestionTemplate } from "../../components/templates/simulateTemplate";
import { Alternativa } from "../../types/question/alternative";

export interface AnswerHistoricoDTO {
    questao: string;
    alternativaCorreta: Alternativa;
    alternativaEstudante?: Alternativa;
}

interface PerformanceSpecific {
    id: string;
    nome: string;
    aproveitamento: number;
}

interface AproveitamentoDTO {
    geral: number;
    materias: PerformanceSpecific[];
    frentes: PerformanceSpecific[];
}

interface TipoSimuladoHistorico {
    _id: string;
    nome: string;
    quantidadeTotalQuestao: number;
    duracao: number;
}

export interface QuestaoHistorico extends QuestionTemplate {
    materia: string;
    frente1: string;
    textoQuestao: string;
    textoAlternativaA: string;
    textoAlternativaB: string;
    textoAlternativaC: string;
    textoAlternativaD: string;
    textoAlternativaE: string;
    status: number;
    updatedAt: string;
    quantidadeSimulado: number;
    prova: string;
}

interface SimuladoHistoricoDTO {
    _id: string;
    nome: string;
    tipo: TipoSimuladoHistorico;
    questoes: QuestaoHistorico[];
    aproveitamento: number;
    vezesRespondido: number;
}

export interface HistoricoDTO {
    _id: string;
    usuario: number;
    ano: number;
    simulado: SimuladoHistoricoDTO;
    respostas: AnswerHistoricoDTO[];
    tempoRealizado: number;
    questoesRespondidas: number;
    aproveitamento: AproveitamentoDTO
}
