import { VariantProps, tv } from "tailwind-variants";
import { useState } from "react";
import { QuestionBoxStatus } from "../../../enums/simulado/questionBoxStatus";

const questionBox = tv({
    base: 'w-8 h-8 rounded m-1 cursor-pointer flex justify-center items-center pb-1 text-base border relative',
    variants: {
        status: {
            unsolved : 'bg-lightYellow border-marine',
            solved : 'bg-white border-marine',
            active : 'bg-orange border-orange text-white font-black',
            unread : 'bg-lightGray border-grey opacity-50',
            isRight: 'bg-white border-marine',
            // tickets/042 (D5). ⚠️ `rose`, não `red`: o tailwind.config troca
            // `red` por uma cor só, e `red-500` não gera CSS.
            anulada: 'bg-white border-rose-400 text-rose-700 cursor-not-allowed opacity-80'
        }
    },
    defaultVariants: {
        status: 'unsolved'
    }
})

export type QuestionBoxProps = React.ComponentProps<"div"> & VariantProps<typeof questionBox> & {
    number: number;
    /**
     * tickets/042, card 16: no RESULTADO a anulada abre (o aluno lê o motivo).
     * No simulado (padrão) não abre.
     */
    abreQuandoAnulada?: boolean;
}

export const DICA_ANULADA = "Questão anulada: não conta na nota";

function QuestionBox({ number, status, onClick, abreQuandoAnulada = false, ...props }: QuestionBoxProps) {
    const anulada = status === QuestionBoxStatus.anulada;
    // No celular não há hover: o toque mostra a dica, e não abre a questão.
    // `null` = fechada. Alinha pela posição na tela: centrada, a dica da 1ª
    // coluna saía cortada à esquerda (medido em 360 px).
    const [dica, setDica] = useState<null | "centro" | "esquerda" | "direita">(null);
    const abrirDica = (e: React.MouseEvent<HTMLDivElement>) => {
        if (dica) return setDica(null);
        const r = e.currentTarget.getBoundingClientRect();
        const largura = typeof window !== "undefined" ? window.innerWidth : 0;
        setDica(r.left < 100 ? "esquerda" : largura && r.right > largura - 100 ? "direita" : "centro");
    };
    return (
        <div
            className={questionBox({ status, class: anulada && abreQuandoAnulada ? "cursor-pointer" : undefined })}
            {...(anulada
                ? {
                    role: abreQuandoAnulada ? "button" : "img",
                    "aria-label": `Questão ${number}: ${DICA_ANULADA}`,
                    title: DICA_ANULADA,
                    onClick: abreQuandoAnulada ? onClick : abrirDica,
                    onMouseLeave: () => setDica(null),
                }
                : { onClick })}
            {...props}
        >
            {number}
            {anulada && (
                <svg aria-hidden className="absolute inset-0 h-full w-full text-rose-600 opacity-60" viewBox="0 0 32 32">
                    <path d="M5 5 L27 27 M27 5 L5 27" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
            )}
            {anulada && dica && (
                <span
                    role="tooltip"
                    className={`absolute bottom-full z-20 mb-1 w-max max-w-[12rem] rounded bg-gray-900 px-2 py-1 text-xs font-normal text-white ${
                        dica === "esquerda" ? "left-0" : dica === "direita" ? "right-0" : "left-1/2 -translate-x-1/2"
                    }`}
                >
                    {DICA_ANULADA}
                </span>
            )}
            {status === QuestionBoxStatus.isRight && <div className="absolute -right-2 -bottom-2 w-0 h-0 border-transparent border-t-green2 border-8 -rotate-45" />}
        </div>
    ) 
}

export default QuestionBox