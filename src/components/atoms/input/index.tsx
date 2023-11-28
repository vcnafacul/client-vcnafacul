import { VariantProps, tv } from "tailwind-variants"

const input = tv({
    base: 'bg-white appearance-none box-border w-full rounded-lg border text-grey' + 
    ' text-xs pl-5 pr-2 pt-5 pb-2 mb-6 outline-orange bg-no-repeat md:text-base md:pt-7 md:pb-3 md:mx-6',
    variants: {
        erro: {
            true: 'border-red-500',
            false: 'border-gray-300'
        },
        size: {
            base: 'h-14',
            small: 'h-11'
        }
    },
    defaultVariants: {
        erro: false,
        size: 'base'
    }
})

export type InputProps = VariantProps<typeof input> & {
    className?: string;
    type: string;
}

function Input({ erro, size, type, className } : InputProps){
    return (
        <input className={input({ erro, size, className })} type={type} />
    )
}

export default Input