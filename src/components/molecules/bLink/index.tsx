import React from "react";
import { Link } from "react-router-dom"
import ButtonTemplate, { buttonTemplate } from "../../atoms/buttonTemplate";
import { VariantProps } from "tailwind-variants";

export type BLinkProps = VariantProps<typeof buttonTemplate> & {
    to: string;
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    type?: string;
    size?: string;
    target?: '_blank' | '_self';
}

function BLink({to, children, type, size, hover, className, target = '_self', ...props} : BLinkProps){
    if(to.includes('#')) {
        return (
            <a className="flex justify-center items-center" target={target} href={to}>
                <ButtonTemplate type={type} size={size} hover={hover} className={className} {...props}>
                {children}
                </ButtonTemplate>
            </a>
        )
    }
    return (
        <Link className="flex justify-center items-center" target={target} to={to}>
            <ButtonTemplate type={type} size={size} hover={hover} className={className} {...props}>
            {children}
            </ButtonTemplate>
        </Link>
    )
}

export default BLink