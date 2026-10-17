import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'
import { Alternativa } from "../../types/question/alternative";
import { QuestionTemplate } from "../../components/templates/simulateTemplate";

export interface Answer {
    questao: string;
    alternativaEstudante: Alternativa;
}

export interface AnswerSimulado {
    idSimulado: string;
    respostas: Answer[];
    tempoRealizado: number;
}

export interface Question extends QuestionTemplate {
    _id: string;
    exam: string;
    year: number;
    book: string;
    materia: string;
    solved: boolean;
    answered?: Alternativa;
    viewed: boolean
    /**
     * tickets/042 (D5): anulada nesta prova. Nasce `solved` (o `finish =
     * every(solved)` continua valendo), nunca fica ativa e não é enviada.
     */
    anulada?: boolean;
}

export interface Simulado {
    _id: string,
    title: string;
    started: Date;
    finished: Date;
    nQuestion: number;
    questions: Question[];
    questionActive: number;
    duration: number;
    finish?: boolean;
}

const initialSimulado : Simulado = {
    _id: "",
    title: "",
    started: new Date(),
    finished: new Date(),
    nQuestion: 0,
    questions: [],
    questionActive: 0,
    duration: 0,
    finish: false,
}

/**
 * ⚠️ `numero` aqui é o ÍNDICE (o `getSimuladoById` re-indexa por posição), e
 * `questionActive` também.
 *
 * tickets/042: as anuladas nascem `solved`, então os dois laços já as pulam; o
 * fallback (todas respondidas) também tem de pular — antes devolvia `active ± 1`
 * sem olhar.
 */
export function nextQuestionActive(question: Question[], active: number){
    for (let index = active + 1; index < question.length; index++) {
        if(!question[index].solved) return question[index].numero
    }
    for (let index = 0; index < active; index++) {
        if(!question[index].solved) return question[index].numero
    }
    return vizinhaValida(question, active, +1);
}

export function priorQuestionActive(question: Question[], active: number){
    for (let index = active - 1; index > -1; index--) {
        if(!question[index].solved) return question[index].numero
    }
    for (let index = question.length - 1; index > active; index--) {
        if(!question[index].solved) return question[index].numero
    }
    return vizinhaValida(question, active, -1);
}

/** A próxima (ou anterior), em círculo, que não seja anulada; sem nenhuma, fica. */
function vizinhaValida(question: Question[], active: number, passo: 1 | -1) {
    const n = question.length;
    for (let i = 1; i < n; i++) {
        const index = (((active + passo * i) % n) + n) % n;
        if (!question[index].anulada) return index;
    }
    return active;
}

/** A primeira questão que o aluno pode abrir (tickets/042). */
export function primeiraValida(question: Pick<Question, "anulada">[]) {
    const i = question.findIndex((q) => !q.anulada);
    return i < 0 ? 0 : i;
}

type SimuladoState = {
    data: Simulado,
    simuladoBegin: (simulado: Simulado) => void;
    setActive: (numberQuestion: number) => void;
    setAnswer: (alt: Alternativa) => void;
    nextQuestion: () => void;
    priorQuestion: () => void;
    confirm: () => void;
    isFinish: () => void;
    setFinish: () => void;
}

export const useSimuladoStore = create<SimuladoState>()(
    persist(
      (set) => ({
        data: initialSimulado,
        simuladoBegin: (simulado) => {
            set(() => ({ data: simulado }))
        },
        setActive: (numberQuestion) => {
            // tickets/042 (D5): a anulada não abre.
            if (useSimuladoStore.getState().data.questions[numberQuestion]?.anulada) return;
            set((state) => ({
                data: {
                        ...state.data, 
                        questions: state.data.questions.map((q, i) =>
                            i === state.data.questionActive ? { ...q, viewed: true} : q
                        ),
                        questionActive: numberQuestion
                }
            }))
        },
        setAnswer: (alt) => {
            set((state) => ({
                data: {
                    ...state.data,
                    questions: state.data.questions.map((q, i) =>
                        i === state.data.questionActive ? { ...q, answered: alt } : q
                    )
                }
            }));
        },
        nextQuestion: () => {
            set((state) => ({
                data: {
                    ...state.data,
                    questionActive: nextQuestionActive(state.data.questions, state.data.questionActive),
                    questions: state.data.questions.map((q, i) =>
                        i === state.data.questionActive ? { ...q, viewed: true } : q
                    )
                }
            }))
        },
        priorQuestion: () => {
            set((state) => ({
                data: {
                    ...state.data,
                    questionActive: priorQuestionActive(state.data.questions, state.data.questionActive),
                    questions: state.data.questions.map((q, i) =>
                        i === state.data.questionActive ? { ...q, viewed: true } : q
                    )
                }
            }))
        },
        confirm: () => {
            set((state) => ({
                data: {
                    ...state.data,
                    questions: state.data.questions.map((q, i) =>
                        i === state.data.questionActive ? { ...q, solved: true} : q
                    ),
                    questionActive: nextQuestionActive(state.data.questions, state.data.questionActive)
                }
            }))
        },
        isFinish: () => {
            set((state) => ({
                data: {
                    ...state.data,
                    finish: state.data.questions.every(q => q.solved),
                    finished: new Date()
                }
            }))
        },
        setFinish: () => {
            set((state) => ({
                data: {
                    ...state.data,
                    finish: true,
                    finished: new Date()
                }
            }))
        }
    }
    ),
      {
        name: 'simulado-storage', // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      }
    )
  )