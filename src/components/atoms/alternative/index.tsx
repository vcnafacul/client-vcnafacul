import { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Alternativa } from "../../../types/question/alternative";

const alternative = cva(
  'flex justify-center items-center text-h2 text-foreground font-bold border-none rounded-sm w-12 h-12 cursor-pointer disabled:cursor-not-allowed',
  {
    variants: {
        select: {
            true: 'bg-warning-muted',
            false: 'bg-muted'
        },
    },
    defaultVariants: {
        select: false,
    }
  }
)

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
        <button className={cn(alternative({ select }), className)} {...props}>
            {label}
        </button>
    )
}

export default Alternative