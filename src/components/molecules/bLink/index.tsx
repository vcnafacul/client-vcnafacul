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
}

function BLink({to, children, type, size, hover, className, ...props} : BLinkProps){
    return (
        <ButtonTemplate type={type} size={size} hover={hover} className={className} {...props}>
            <Link className="flex justify-center items-center" to={to}>{children}</Link>
        </ButtonTemplate>
    )
}

export default BLink