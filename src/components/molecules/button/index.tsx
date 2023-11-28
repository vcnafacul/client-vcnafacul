import React, { ComponentProps } from "react";
import ButtonTemplate, { buttonTemplate } from "../../atoms/buttonTemplate";
import { VariantProps } from "tailwind-variants";

export type ButtonProps = VariantProps<typeof buttonTemplate> & ComponentProps<'button'> & {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    type?: string;
    size?: string;
}

function Button({children, type, size, hover, className, ...props} : ButtonProps){
    return (
        <ButtonTemplate type={type} size={size} hover={hover} className={`${className} cursor-pointer w-full flex justify-center`} {...props}>
                {children}
        </ButtonTemplate>
    )
}

export default Button