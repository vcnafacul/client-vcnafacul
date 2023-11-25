import React from "react";
import Header, { HeaderProps } from "../../migrate/Header"
import Hero, { HeroProps } from "../../migrate/Hero"
import Footer, { FooterProps } from "../../organisms/footer";

export interface BaseTemplateProps{
    header: HeaderProps;
    hero: HeroProps;
    children: React.ReactNode
    footer: FooterProps
}

function BaseTemplate({ header, hero, children, footer }: BaseTemplateProps){
    return (
        <div className="flex flex-col">
            <Header {...header} />
            <Hero {...hero} />
            { children }
            <Footer {...footer} />
        </div>
    )
}

export default BaseTemplate