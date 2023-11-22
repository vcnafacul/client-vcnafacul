import React from "react";
import { Link } from "react-router-dom"

interface ButtonLinkProps {
    to: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'tertiary'
    className?: string;
}

const textVariants = "inline-block ml-5 border-2 font-bold transition-all duration-250 ease-in-out text-sm px-2.5 py-2.5 md:mb-4.5 md:text-base md:px-7 md:py-3"

const variants = {
    primary: "text-white border-orange bg-orange hover:bg-white hover:text-orange",
    secondary: "text-orange border-orange bg-white hover:bg-orange hover:text-white",
    tertiary: "text-white border-white hover:bg-white hover:text-marine",
  }

function ButtonLink({to, children, className, variant = 'primary'} : ButtonLinkProps){
    return (
        <div className={`${textVariants} ${variants[variant]} ${className}`}>
            <Link to={to}>{children}</Link>
        </div>
    )
}

export default ButtonLink