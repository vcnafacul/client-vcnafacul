import React from "react"
import { VariantProps, tv } from "tailwind-variants"

const text = tv({
    base: "text-foreground mb-6 text-center",
    variants: {
        size: {
            primary: "text-h1 leading-10 font-bold ",
            secondary: "text-h1 font-bold ",
            tertiary: "text-body leading-6 md:leading-9",
            quaternary: "text-body mb-3"
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