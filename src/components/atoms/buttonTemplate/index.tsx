import React, { ComponentProps } from "react";
import { VariantProps, tv } from "tailwind-variants";

const getHoverClasses = (type: string, isHoverEnabled?: boolean): string => {
  if (!isHoverEnabled) return "";
  return (
    {
      primary: "hover:opacity-50 duration-300",
      secondary: "hover:bg-orange hover:text-white",
      tertiary: "hover:bg-white hover:text-marine",
      quaternary: "hover:bg-gray-200 hover:text-marine",
    }[type] || ""
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const buttonTemplate = tv({
  base: "flex justify-center items-center border-2 font-bold transition-all duration-250 ease-in-out text-sm md:text-base rounded-md group gap-1 cursor-pointer",
  variants: {
    typeStyle: {
      accepted: "bg-green3 text-white",
      refused: "bg-red text-white",
      primary: "text-white border-orange bg-orange",
      secondary: "text-orange border-orange bg-white",
      tertiary: "text-white border-white",
      quaternary: "bg-white border-marine text-marine border-opacity-50",
      none: "bg-transparent border-0",
    },
    size: {
      base: "w-full h-12 ",
      small: "w-fit h-fit px-2 py-1",
    },
    disabled: {
      true: "cursor-not-allowed opacity-30",
      false: "",
    },
  },
  defaultVariants: {
    typeStyle: "primary",
    size: "base",
    disabled: false,
  },
});

export type ButtonTemplateProps = VariantProps<typeof buttonTemplate> &
  ComponentProps<"div"> & {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    disabled?: boolean;
  };

function ButtonTemplate({
  children,
  typeStyle,
  size,
  hover,
  className,
  disabled,
  ...props
}: ButtonTemplateProps) {
  const hoverClasses = getHoverClasses(typeStyle as string, hover);
  const buttonClasses =
    buttonTemplate({ typeStyle, size, disabled, className }) +
    ` ${hoverClasses}`;
  return (
    <div className={buttonClasses} {...props}>
      {children}
    </div>
  );
}

export default ButtonTemplate;
