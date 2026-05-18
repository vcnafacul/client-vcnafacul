import { SidebarDash } from "@/components/organisms/sidebarDash";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../../../context/baseTemplateContext";
import { headerDash } from "../../../pages/dash/data";
import { NEWS } from "../../../routes/path";
import { getNews } from "../../../services/news/getNews";
import BaseTemplate from "../baseTemplate";

type DashTemplateProps = {
  className?: string;
  hasMenu?: boolean;
};

function DashTemplateContent({ hasMenu }: { hasMenu?: boolean }) {
  const { open } = useSidebar();

  return (
    <div
      className={`relative top-[76px] h-[calc(100vh-76px)] w-full flex flex-row`}
    >
      <div
        className={`xl:mr-0 w-full overflow-y-scroll scrollbar-hide flex-1 min-w-0`}
      >
        <Outlet />
      </div>
      <div
        className={`z-20 h-[calc(100vh-76px)] absolute xl:relative xl:right-0 transition-all duration-200`}
      >
        {hasMenu ? <SidebarDash /> : <></>}
      </div>
      <SidebarTrigger
        className={`fixed z-30 top-24 transition-all duration-200 ${
          open ? "right-[0.5rem] xl:right-[16rem]" : "right-4"
        }`}
      />
    </div>
  );
}

function DashTemplate({ className, hasMenu }: DashTemplateProps) {
  const [hasNews, setHasNews] = useState<boolean | null>(null);

  useEffect(() => {
    getNews()
      .then((res) => setHasNews((res.data?.length ?? 0) > 0))
      .catch(() => setHasNews(false));
  }, []);

  const headerValue = useMemo(() => {
    const pageLinks =
      hasNews === false
        ? headerDash.pageLinks.filter(
            (l) => l.Home_Menu_Item_id.link !== NEWS,
          )
        : headerDash.pageLinks;
    return { ...headerDash, pageLinks };
  }, [hasNews]);

  return (
    <BaseTemplateContext.Provider
      value={{ header: headerValue, hasFooter: false, hasNews }}
    >
      <BaseTemplate
        className={`overflow-y-clip scrollbar-hide h-full ${className} overflow-x-hidden`}
        solid
        position="fixed"
      >
        <SidebarProvider>
          <DashTemplateContent hasMenu={hasMenu} />
        </SidebarProvider>
      </BaseTemplate>
    </BaseTemplateContext.Provider>
  );
}

export default DashTemplate;
