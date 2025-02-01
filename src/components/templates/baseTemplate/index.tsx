import React, { ComponentProps } from "react";
import { VariantProps, tv } from "tailwind-variants";
import Footer from "../../organisms/footer";
import Header from "../../organisms/header";

const baseTemplate = tv({
    base: "w-full z-50  text-white h-[76px]",
    variants: {
        position: {
            fixed: 'fixed top-0 left-0',
            relative: 'relative'
        },
        headerShadow: {
            true: 'shadow-lg',
            false: 'shadow-none'
        }
    },
    defaultVariants: {
        position: 'relative',
        headerShadow: true
    }
})

export type BaseTemplateProps = VariantProps<typeof baseTemplate> & ComponentProps<'div'> & {
    children: React.ReactNode;
    solid: boolean;
    className?: string;
    headerShadow?: boolean;
}

function BaseTemplate({  children, solid, position, headerShadow, className }: BaseTemplateProps){
  return (
    <div className={className}>
      <div className="min-h-screen w-screen flex flex-col">
          <Header
          solid={solid}
          className={`${baseTemplate({ position, headerShadow })} ${solid ? 'bg-white' : 'bg-transparent'} px-2`}
        />
        <div className="flex-1">
          { children }
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BaseTemplate
