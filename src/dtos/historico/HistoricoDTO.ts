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

interface SimuladoHistoricoDTO {
    _id: string;
    nome: string;
    tipo: TipoSimuladoHistorico;
}

export interface HistoricoDTO {
    _id: string;
    usuario: number;
    simulado: SimuladoHistoricoDTO;
    respostas?: AnswerHistoricoDTO[];
    tempoRealizado: number;
    questoesRespondidas: number;
    aproveitamento: AproveitamentoDTO
}