import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { footer, header } from "../pages/homeLegacy/data";
import { DASH, HOME_PATH, NEWS } from "../routes/path";
import { getNews } from "../services/news/getNews";
import { useAuthStore } from "../store/auth";
import { ItemMenuProps } from "../components/molecules/menuItems";

const painelDoEstudanteLink: ItemMenuProps = {
  Home_Menu_Item_id: {
    id: 99,
    name: "Painel do Estudante",
    link: DASH,
    target: "_self",
  },
};

export function BaseRoutes() {
  const [hasNews, setHasNews] = useState<boolean | null>(null);
  const token = useAuthStore((s) => s.data.token);
  const { pathname } = useLocation();
  const isHome = pathname === HOME_PATH;

  useEffect(() => {
    getNews()
      .then((res) => setHasNews((res.data?.length ?? 0) > 0))
      .catch(() => setHasNews(false));
  }, []);

  let basePageLinks: ItemMenuProps[];
  if (token && isHome) {
    basePageLinks = [...header.pageLinks, painelDoEstudanteLink];
  } else {
    basePageLinks = header.pageLinks;
  }

  const pageLinks =
    hasNews === false
      ? basePageLinks.filter((l) => l.Home_Menu_Item_id.link !== NEWS)
      : basePageLinks;

  const value = {
    header: { ...header, pageLinks },
    footer,
    hasFooter: true,
    hasNews,
  };

  return (
    <BaseTemplateContext.Provider value={value}>
      <Outlet />
    </BaseTemplateContext.Provider>
  );
}
