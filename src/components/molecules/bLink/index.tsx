import React from "react";
import { Link } from "react-router-dom";
import { VariantProps } from "tailwind-variants";
import ButtonTemplate, { buttonTemplate } from "../../atoms/buttonTemplate";

export type BLinkProps = VariantProps<typeof buttonTemplate> & {
  to: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  type?: "primary" | "secondary" | "tertiary" | "quaternary" | "none";
  size?: string;
  target?: "_blank" | "_self";
};

function BLink({
  to,
  children,
  type,
  size,
  hover,
  className,
  target = "_self",
  ...props
}: BLinkProps) {
  if (to.includes("#")) {
    return (
      <a className="w-full h-full" target={target} href={to}>
        <ButtonTemplate
          typeStyle={type}
          size={size}
          hover={hover}
          className={className}
          {...props}
        >
          {children}
        </ButtonTemplate>
      </a>
    );
  }
  return (
    <Link className="w-full h-full" target={target} to={to}>
      <ButtonTemplate
        typeStyle={type}
        size={size}
        hover={hover}
        className={className}
        {...props}
      >
        {children}
      </ButtonTemplate>
    </Link>
  );
}

export default BLink;
