/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { Slide } from "../components/organisms/hero";

// eslint-disable-next-line react-refresh/only-export-components
const HeroContext = createContext<{ heroSlides: Slide[] } | null>(null)

function useHeroContext() {
    const context = useContext(HeroContext);
    if(!context) {
        throw new Error(
            "HeroContext.* component must br rendered as child of Hero component"
        )
    }
    return context
}

export {
    HeroContext, useHeroContext
};
