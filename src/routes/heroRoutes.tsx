import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { HeroContext } from "../context/heroContext";
import { getHeroSlides } from "../services/directus/home/hero";
import { useHomeStore } from "../store/home";
import { DiffTime } from "../utils/diffTime";

export function HeroRoutes() {
  const { hero, setHero } = useHomeStore();

  useEffect(() => {
    if (hero.data.length === 0 || DiffTime(hero.updated, 8)) {
      getHeroSlides()
        .then((res) => {
          setHero(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, []);

  return (
    <HeroContext.Provider value={{ heroSlides: hero.data }}>
      <Outlet />
    </HeroContext.Provider>
  );
}
