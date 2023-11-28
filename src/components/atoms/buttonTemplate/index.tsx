import React from "react";
import { VariantProps, tv } from "tailwind-variants";

const getHoverClasses = (type: string, isHoverEnabled?: boolean) : string => {
    if (!isHoverEnabled) return "";
    return {
        primary: "hover:opacity-75 duration-300",
        secondary: "hover:bg-orange hover:text-white",
        tertiary: "hover:bg-white hover:text-marine",
    }[type] || "";
};

// eslint-disable-next-line react-refresh/only-export-components
export const buttonTemplate = tv({
    base: "inline-block border-2 font-bold transition-all duration-250 ease-in-out text-sm  md:text-base",
    variants: {
        type: {
            primary: "text-white border-orange bg-orange",
            secondary: "text-orange border-orange bg-white",
            tertiary: "text-white border-white",
        },
        size: {
            base: 'px-2.5 py-2.5 md:px-7 md:py-3 md:mx-2 md:mb-4.5',
            small: 'px-1 py-1 md:px-2 md:py-1'
        }
    },
    defaultVariants: {
        type: 'primary',
        size: 'base'
    }
})

export type ButtonTemplateProps = VariantProps<typeof buttonTemplate> & {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

function ButtonTemplate({children, type, size, hover, className, ...props} : ButtonTemplateProps){
    const hoverClasses = getHoverClasses(type as string, hover);
    const buttonClasses = buttonTemplate({type, size, className}) + ` ${hoverClasses}`;
    return (
        <div className={buttonClasses} {...props}>
            {children}
        </div>
    )
}

export default ButtonTemplate