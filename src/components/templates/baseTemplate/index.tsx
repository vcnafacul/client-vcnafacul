import React from "react";
import Header from "../../migrate/Header"
import { HeaderProps } from "../../migrate/Header/types"
import Hero from "../../migrate/Hero"
import { HeroProps } from "../../migrate/Hero/types";

export interface BaseTemplateProps{
    header: HeaderProps;
    hero: HeroProps;
    children: React.ReactNode
    footer: unknown
}

function BaseTemplate({ header, hero, children, footer }: BaseTemplateProps){
    return (
        <div className="flex flex-col">
            <Header {...header} />
            <Hero {...hero} />
            { children }
            {/* <Footer {...footer}/> */}
        </div>
    )
}

export default BaseTemplate