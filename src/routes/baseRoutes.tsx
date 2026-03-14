import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { footer, header } from "../pages/home/data";
import { NEWS } from "../routes/path";
import { getNews } from "../services/news/getNews";

export function BaseRoutes() {
  const [hasNews, setHasNews] = useState<boolean | null>(null);

  useEffect(() => {
    getNews()
      .then((res) => setHasNews((res.data?.length ?? 0) > 0))
      .catch(() => setHasNews(false));
  }, []);

  const pageLinks =
    hasNews === false
      ? header.pageLinks.filter((l) => l.Home_Menu_Item_id.link !== NEWS)
      : header.pageLinks;

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
