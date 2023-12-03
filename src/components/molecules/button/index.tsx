import React, { ComponentProps } from "react";
import ButtonTemplate from "../../atoms/buttonTemplate";

export type ButtonProps =  ComponentProps<'button'> & {
    children?: React.ReactNode;
    className?: string;
    hover?: boolean;
    typeStyle?:  "primary" | "secondary" | "tertiary" | "quaternary" | "none";
    size?: "base" | "small"  | "none";
}

function Button({children, size, hover, className, typeStyle = 'primary', ...props} : ButtonProps){
    return (
        <button {...props} className="w-full disabled:opacity-75 disabled:cursor-not-allowed">
            <ButtonTemplate type={typeStyle} size={size} hover={hover} className={`${className} selection:w-full flex justify-center items-center`}>
                {children}
            </ButtonTemplate>
        </button>
    )
}

export default Button