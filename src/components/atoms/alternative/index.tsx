import { ComponentProps } from "react";
import { VariantProps, tv } from "tailwind-variants";
import { Alternativa } from "../../../store/simulado";

const alternative = tv({
    base: 'flex justify-center items-center text-xl text-marine font-bold border-none rounded w-12 h-12 cursor-pointer disabled:cursor-not-allowed',
    variants: {
        select: {
            true: 'bg-yellow',
            false: 'bg-lightGray'
        },
    },
    defaultVariants: {
        select: false,
    }
})

export interface AlternativeBtn {
    label: string;
    alternative: Alternativa
}

export type AlternativeProps = VariantProps<typeof alternative> & ComponentProps<'button'> & {
    label: string;
    className?: string;
} 

function Alternative({ label, select, className, ...props } : AlternativeProps){
    return (
        <button className={alternative({ select, className })} {...props}>
            {label}
        </button>
    )
}

export default Alternative