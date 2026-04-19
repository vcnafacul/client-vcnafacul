import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { headerDash } from "../pages/dash/data";
import { footer, header } from "../pages/home/data";
import { HOME_PATH, NEWS } from "../routes/path";
import { getNews } from "../services/news/getNews";
import { useAuthStore } from "../store/auth";
import { ItemMenuProps } from "../components/molecules/menuItems";

function mergeHeaderLinksForHome(
  homeLinks: ItemMenuProps[],
  dashLinks: ItemMenuProps[],
): ItemMenuProps[] {
  const seen = new Set<string>();
  const merged: ItemMenuProps[] = [];
  let nextId = 1;

  for (const item of [...homeLinks, ...dashLinks]) {
    const link = item.Home_Menu_Item_id.link;
    if (seen.has(link)) continue;
    seen.add(link);
    merged.push({
      ...item,
      Home_Menu_Item_id: { ...item.Home_Menu_Item_id, id: nextId++ },
    });
  }
  merged.pop();
  return merged;
}

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
  if (!token) {
    basePageLinks = header.pageLinks;
  } else if (isHome) {
    basePageLinks = mergeHeaderLinksForHome(header.pageLinks, headerDash.pageLinks);
  } else {
    basePageLinks = headerDash.pageLinks;
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
