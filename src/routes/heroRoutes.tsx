import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { HeroContext } from "../context/heroContext";
import { getHeroSlides } from "../services/directus/home/hero";
import { useHomeStore } from "../store/home";

export function HeroRoutes() {
  const { hero, setHero } = useHomeStore();

  useEffect(() => {
    if (
      hero.data.length === 0 ||
      hero.updatedHero < new Date(new Date().getTime() - 3600 * 8)
    ) {
      getHeroSlides()
        .then((res) => {
          setHero(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [hero.data.length]);

  return (
    <HeroContext.Provider value={{ heroSlides: hero.data }}>
      <Outlet />
    </HeroContext.Provider>
  );
}
