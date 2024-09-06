import { Outlet } from "react-router-dom";
import { HeroContext } from "../context/heroContext";
import { hero } from "../pages/home/data";

export function HeroRoutes() {
  return (
    <HeroContext.Provider value={{ heroSlides: hero }}>
      <Outlet />
    </HeroContext.Provider>
  );
}
