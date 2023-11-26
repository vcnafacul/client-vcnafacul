import React, { LegacyRef, useEffect, useRef, useState } from "react";
import Header, { HeaderProps } from "../../organisms/header"
import Hero, { HeroProps } from "../../organisms/hero"
import Footer, { FooterProps } from "../../organisms/footer";

export interface BaseTemplateProps{
    header: HeaderProps;
    hero: HeroProps;
    children: React.ReactNode
    footer: FooterProps
}

function BaseTemplate({ header, hero, children, footer }: BaseTemplateProps){
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
            <Header itemsMenu={header.itemsMenu} socialLinks={header.socialLinks} solid={solid} />
            <Hero {...hero} />
            { children }
            <Footer {...footer} />
        </div>
    )
}

export default BaseTemplate