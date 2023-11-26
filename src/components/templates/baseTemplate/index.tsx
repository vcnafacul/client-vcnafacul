import React from "react";
import Header, { HeaderProps } from "../../organisms/header"
import Footer, { FooterProps } from "../../organisms/footer";

export interface BaseTemplateProps{
    header: HeaderProps;
    children: React.ReactNode;
    footer: FooterProps;
    solid: boolean;
    className?: string;
}

function BaseTemplate({ header, children, footer, solid, className }: BaseTemplateProps){
    
    return (
        <div className={className}>
            <Header itemsMenu={header.itemsMenu} socialLinks={header.socialLinks} solid={solid} />
            { children }
            <Footer {...footer} />
        </div>
    )
}

export default BaseTemplate