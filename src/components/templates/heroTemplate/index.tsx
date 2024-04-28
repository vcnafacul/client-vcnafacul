import React, { LegacyRef, useEffect, useRef, useState } from "react";
import Hero from "../../organisms/hero";
import BaseTemplate from "../baseTemplate";
export interface HeroTemplateProps{
    children: React.ReactNode;
    headerPosition?: 'fixed' | 'relative';
}

function HeroTemplate({ children, headerPosition = 'relative' }: HeroTemplateProps){
    
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
        <div ref={scrollContainerRef as LegacyRef<HTMLDivElement>} className="flex flex-col overflow-y-auto scrollbar-hide h-screen overflow-x-hidden">
            <BaseTemplate solid={solid} position={headerPosition} headerShadow={false}>
                <Hero />
                { children }
            </BaseTemplate>
        </div>
    )
}

export default HeroTemplate