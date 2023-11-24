import React from "react"
import { VariantProps, tv } from "tailwind-variants"

const text = tv({
    base: "text-marine mb-6 text-center",
    variants: {
        size: {
            primary: "text-4xl md:text-5xl leading-10 font-bold ",
            secondary: "text-4xl leading-9 md:leading-6 font-bold ",
            tertiary: "text-base md:text-xl leading-6 md:leading-9",
        }
    },
    defaultVariants: {
        size: 'primary',
    }
})

export type TextProps = VariantProps<typeof text> & {
    children: React.ReactNode;
    className?: string;
}

function Text({children, size, className}: TextProps) {
    return (
        <div className={text({ size, className })}>{children}</div>
    )
}

export default Text