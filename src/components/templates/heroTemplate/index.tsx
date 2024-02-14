import React, { LegacyRef, useEffect, useRef, useState } from "react";
import { FooterProps } from "../../organisms/footer";
import { HeaderProps } from "../../organisms/header";
import Hero, { Slide } from "../../organisms/hero";
import { HeroSkeleton } from "../../organisms/heroSkeleton";
import BaseTemplate from "../baseTemplate";
import { getHeroSlides } from "../../../services/directus/home/hero";
import { toast } from "react-toastify";

export interface HeroTemplateProps{
    header: HeaderProps;
    children: React.ReactNode;
    footer: FooterProps;
    headerPosition?: 'fixed' | 'relative';
}

function HeroTemplate({ header, children, footer, headerPosition = 'relative' }: HeroTemplateProps){
    
    const [solid, setSolid] = useState(false);
    const scrollContainerRef = useRef<HTMLElement>(null);
    const [slides, SetSlides] = useState<Slide[]>([]) 
    const [loading, setLoagind] = useState<boolean>(true);

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

    useEffect(() => {
        if(slides.length === 0){
            getHeroSlides()
            .then(res => {
                setLoagind(false)
                SetSlides(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }, [slides.length])

    return (
        <div ref={scrollContainerRef as LegacyRef<HTMLDivElement>} className="flex flex-col overflow-y-auto scrollbar-hide h-screen">
            <BaseTemplate header={header} footer={footer} solid={solid} position={headerPosition} headerShadow={false}>
                { loading ? <HeroSkeleton /> : <Hero data={slides}/>}
                { children }
            </BaseTemplate>
        </div>
    )
}

export default HeroTemplate