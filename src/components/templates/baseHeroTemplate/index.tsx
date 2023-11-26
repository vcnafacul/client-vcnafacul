import React, { LegacyRef, useEffect, useRef, useState } from "react";
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
    
    const [solid, setSolid] = useState(false);
    const scrollContainerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const shouldBeSolid = scrollContainerRef.current.scrollTop > 150;
                setSolid(shouldBeSolid)
            }
        };

        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div ref={scrollContainerRef as LegacyRef<HTMLDivElement>} className="flex flex-col overflow-y-auto scrollbar-hide h-screen">
            <BaseTemplate header={header} footer={footer} solid={solid} >
                <Hero {...hero} />
                { children }
            </BaseTemplate>
        </div>
    )
}

export default BaseHeroTemplate