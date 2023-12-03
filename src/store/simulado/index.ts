import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'

export enum Alternativa {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
  }

export interface Answer {
    questao: string;
    alternativaEstudante: Alternativa;
}

export interface AnswerSimulado {
    idSimulado: string;
    respostas: Answer[];
}

export interface Question {
    _id: string;
    imageId: string;
    exam: string;
    year: number;
    book: string;
    enemArea: string;
    materia: string;
    number: number;
    solved: boolean;
    answered?: Alternativa;
    viewed: boolean
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

function nextQuestionActive(question: Question[], active: number){
    for (let index = active + 1; index < question.length; index++) {
        if(!question[index].solved) return question[index].number
    }
    for (let index = 0; index < active; index++) {
        if(!question[index].solved) return question[index].number
    }
    return active + 1 >= question.length ? 0 : active + 1;
}

function priorQuestionActive(question: Question[], active: number){
    for (let index = active - 1; index > -1; index--) {
        if(!question[index].solved) return question[index].number
    }
    for (let index = question.length - 1; index > active; index--) {
        if(!question[index].solved) return question[index].number
    }
    return active - 1 < 0 ? question.length - 1 : active - 1;
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