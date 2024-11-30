import React, { ComponentProps, MouseEventHandler } from "react";
import ButtonTemplate from "../../atoms/buttonTemplate";

export type ButtonProps = ComponentProps<"button"> & {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
  typeStyle?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "accepted"
    | "refused"
    | "none";
  size?: "base" | "small";
};

function Button({
  children,
  hover,
  size = "base",
  className,
  typeStyle,
  ...props
}: ButtonProps) {
  return (
    <ButtonTemplate
      typeStyle={typeStyle}
      size={size}
      hover={props.disabled ? false : hover}
      className={className}
      disabled={props.disabled}
      onClick={props.onClick as MouseEventHandler<HTMLDivElement> | undefined}
    >
      <button
        {...props}
        onClick={() => {}}
        className="relative w-full h-full bg-transparent disabled:cursor-not-allowed"
      >
        {children}
      </button>
    </ButtonTemplate>
  );
}

export default Button;
