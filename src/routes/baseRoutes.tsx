import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { footer, header } from "../pages/homeLegacy/data";
import { NEWS } from "../routes/path";
import { getNews } from "../services/news/getNews";
import { ItemMenuProps } from "../components/molecules/menuItems";

export function BaseRoutes() {
  const [hasNews, setHasNews] = useState<boolean | null>(null);

  useEffect(() => {
    getNews()
      .then((res) => setHasNews((res.data?.length ?? 0) > 0))
      .catch(() => setHasNews(false));
  }, []);

  // O "Painel do Estudante" saiu daqui: está no menu do usuário (header).
  const basePageLinks: ItemMenuProps[] = header.pageLinks;

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
