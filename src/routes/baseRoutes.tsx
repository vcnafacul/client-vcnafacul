import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { headerDash } from "../pages/dash/data";
import { footer, header } from "../pages/home/data";
import { NEWS } from "../routes/path";
import { getNews } from "../services/news/getNews";
import { useAuthStore } from "../store/auth";

export function BaseRoutes() {
  const [hasNews, setHasNews] = useState<boolean | null>(null);
  const token = useAuthStore((s) => s.data.token);

  useEffect(() => {
    getNews()
      .then((res) => setHasNews((res.data?.length ?? 0) > 0))
      .catch(() => setHasNews(false));
  }, []);

  const basePageLinks = token ? headerDash.pageLinks : header.pageLinks;

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
