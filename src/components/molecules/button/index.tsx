import React, { ComponentProps } from "react";
import ButtonTemplate from "../../atoms/buttonTemplate";

export type ButtonProps = ComponentProps<"button"> & {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
  typeStyle?: "primary" | "secondary" | "tertiary" | "quaternary" | "none";
  size?: "base" | "small";
};

function Button({
  children,
  hover,
  size = "base",
  className,
  typeStyle = "primary",
  ...props
}: ButtonProps) {
  return (
    <ButtonTemplate
      typeStyle={typeStyle}
      size={size}
      hover={props.disabled ? false : hover}
      className={className}
    >
      <button {...props} className="relative w-full h-full">
        {children}
      </button>
    </ButtonTemplate>
  );
}

export default Button;
