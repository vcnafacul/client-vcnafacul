import React from "react";
import { HeaderProps } from "../../organisms/header"
import Hero, { HeroProps } from "../../organisms/hero"
import  { FooterProps } from "../../organisms/footer";
import BaseTemplate from "../baseTemplate";

export interface BaseHeroTemplateProps{
    header: HeaderProps;
    hero: HeroProps;
    children: React.ReactNode
    footer: FooterProps
}

function BaseHeroTemplate({ header, hero, children, footer }: BaseHeroTemplateProps){
    
    return (
        <div>
            <BaseTemplate header={header} footer={footer}>
                <Hero {...hero} />
                { children }
            </BaseTemplate>
        </div>
    )
}

export default BaseHeroTemplate