import { ComponentProps } from "react";
import { VariantProps, tv } from "tailwind-variants";
import { Alternativa } from "../../../types/question/alternative";

const alternative = tv({
    base: 'flex justify-center items-center text-xl text-marine font-bold border-none rounded w-12 h-12 cursor-pointer disabled:cursor-not-allowed',
    variants: {
        select: {
            true: 'bg-yellow',
            false: 'bg-lightGray'
        },
        disabled: {
            true: 'cursor-not-allowed',
            false: 'cursor-pointer'
        }
    },
    defaultVariants: {
        select: false,
    }
})

export interface AlternativeBtn {
    label: string;
    alternative: Alternativa
}

export type AlternativeProps = VariantProps<typeof alternative> & ComponentProps<'div'> & {
    label: string;
    className?: string;
    disabled?: boolean;
} 

function Alternative({ label, select, disabled = false, className, ...props } : AlternativeProps){
    return (
        <div className={alternative({ select, className, disabled })} {...props}>
            {label}
        </div>
    )
}

export default Alternative