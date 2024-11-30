import React, { ComponentProps } from "react";
import { VariantProps, tv } from "tailwind-variants";

// const getHoverClasses = (type: string, isHoverEnabled?: boolean): string => {
//   if (!isHoverEnabled) return "";
//   return (
//     {
//       primary: "hover:opacity-50 duration-300",
//       secondary: "hover:bg-orange hover:text-white",
//       tertiary: "hover:bg-white hover:text-marine",
//       quaternary: "hover:bg-gray-200 hover:text-marine",
//     }[type] || ""
//   );
// };

// eslint-disable-next-line react-refresh/only-export-components
export const buttonTemplate = tv({
  base: "flex justify-center items-center border-2 font-bold transition-all duration-250 ease-in-out text-sm md:text-base rounded-md group gap-1 cursor-pointer",
  variants: {
    typeStyle: {
      accepted: "bg-green3 text-white hover:bg-green3/80",
      refused: "bg-red text-white hover:bg-red/80",
      primary: "text-white border-orange bg-orange hover:bg-orange/80",
      secondary: "text-orange border-orange bg-white hover:bg-orange/90 hover:text-white",
      tertiary: "text-white border-white hover:bg-white hover:text-marine",
      quaternary: "bg-white border-marine text-marine border-opacity-50 hover:bg-marine/90 hover:text-white",
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
  className,
  disabled,
  ...props
}: ButtonTemplateProps) {
  const buttonClasses =
    buttonTemplate({ typeStyle, size, disabled, className });
  return (
    <div className={buttonClasses} {...props}>
      {children}
    </div>
  );
}

export default ButtonTemplate;
