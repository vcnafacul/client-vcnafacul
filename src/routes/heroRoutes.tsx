import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { Slide } from "../components/organisms/hero";
import { HeroContext } from "../context/heroContext";
import { getHeroSlides } from "../services/directus/home/hero";

export function HeroRoutes() {

    const [ heroSlides, SetHeroSlides ] = useState<Slide[]>([]) 
    
    useEffect(() => {
        if(heroSlides.length === 0){
            getHeroSlides()
            .then(res => {
                SetHeroSlides(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }, [heroSlides.length])
    
    return (     
        <HeroContext.Provider value={{ heroSlides }} >
            <Outlet />
        </HeroContext.Provider>
    );
}
