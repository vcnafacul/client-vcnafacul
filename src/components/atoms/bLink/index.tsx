import React from "react";
import { Link } from "react-router-dom"
import { VariantProps, tv } from "tailwind-variants";

const button = tv({
    base: "inline-block border-2 font-bold transition-all duration-250 ease-in-out text-sm  md:text-base",
    variants: {
        type: {
            primary: "text-white border-orange bg-orange hover:bg-white hover:text-orange",
            secondary: "text-orange border-orange bg-white hover:bg-orange hover:text-white",
            tertiary: "text-white border-white hover:bg-white hover:text-marine",
        },
        size: {
            base: 'px-2.5 py-2.5 md:px-7 md:py-3 ml-5 md:mb-4.5',
            small: 'px-1 py-1 md:px-2 md:py-1'
        }
    },
    defaultVariants: {
        type: 'primary',
        size: 'base'
    }
})

export type BLinkProps = VariantProps<typeof button> & {
    to: string;
    children: React.ReactNode;
    className?: string;
}

function BLink({to, children, type, size, className, ...props} : BLinkProps){
    return (
        <div className={button({type, size, className})} {...props}>
            <Link className="flex justify-center items-center" to={to}>{children}</Link>
        </div>
    )
}

export default BLink