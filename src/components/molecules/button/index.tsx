import React, { ComponentProps } from "react";
import ButtonTemplate from "../../atoms/buttonTemplate";

export type ButtonProps =  ComponentProps<'button'> & {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    typeStyle?:  "primary" | "secondary" | "tertiary";
    size?: "base" | "small";
}

function Button({children, size, hover, className, typeStyle = 'primary', ...props} : ButtonProps){
    return (
        <ButtonTemplate type={typeStyle} size={size} hover={hover} className={`${className} cursor-pointer w-full flex justify-center`}>
                <button {...props}>
                    {children}
                </button>
        </ButtonTemplate>
    )
}

export default Button