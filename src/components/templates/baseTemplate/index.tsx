import React from "react";
import Header, { HeaderProps } from "../../organisms/header"
import Footer, { FooterProps } from "../../organisms/footer";
import { VariantProps, tv } from "tailwind-variants";

const baseTemplate = tv({
    base: "w-full z-50 py-4 md:py-5 px-0 text-white h-[76px]",
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

export type BaseTemplateProps = VariantProps<typeof baseTemplate> & {
    header: HeaderProps;
    children: React.ReactNode;
    footer: FooterProps;
    solid: boolean;
    className?: string;
    headerShadow?: boolean;
}

function BaseTemplate({ header, children, footer, solid, position, headerShadow, className }: BaseTemplateProps){
    return (
        <div className={className}>
            <Header 
                className={`${baseTemplate({ position, headerShadow })} ${solid ? 'bg-white' : 'bg-transparent'}`} 
                itemsMenu={header.itemsMenu} 
                socialLinks={header.socialLinks} 
                solid={solid}
                userNavigationSign={header.userNavigationSign}
                userNavigationLogged={header.userNavigationLogged} />
            <div className={`${position !== undefined ? '' : 'h-[calc(100vh-76px)]'}`}>
                { children }
            </div>
            <Footer {...footer} />
        </div>
    )
}

export default BaseTemplate