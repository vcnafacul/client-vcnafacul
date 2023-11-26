import React from "react";
import Header, { HeaderProps } from "../../organisms/header"
import Footer, { FooterProps } from "../../organisms/footer";
import { VariantProps, tv } from "tailwind-variants";

const baseTemplate = tv({
    base: "w-full z-50 py-4 md:py-5 px-0 text-white",
    variants: {
        position: {
            fixed: 'fixed top-0 left-0',
            relative: 'relative'
        }
    },
    defaultVariants: {
        position: 'fixed'
    }
})

export type BaseTemplateProps = VariantProps<typeof baseTemplate> & {
    header: HeaderProps;
    children: React.ReactNode;
    footer: FooterProps;
    solid: boolean;
    className?: string;
}

function BaseTemplate({ header, children, footer, solid, position, className }: BaseTemplateProps){
    
    return (
        <div className={className}>
            <Header 
                className={`${baseTemplate({ position })} ${solid ? 'bg-white' : 'bg-transparent'}`} 
                itemsMenu={header.itemsMenu} 
                socialLinks={header.socialLinks} 
                solid={solid} />
            { children }
            <Footer {...footer} />
        </div>
    )
}

export default BaseTemplate