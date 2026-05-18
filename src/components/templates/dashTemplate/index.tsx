import { SidebarDash } from "@/components/organisms/sidebarDash";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BaseTemplateContext } from "../../../context/baseTemplateContext";
import { headerDash } from "../../../pages/dash/data";
import { DASH } from "../../../routes/path";
import { ItemMenuProps } from "../../../components/molecules/menuItems";
import BaseTemplate from "../baseTemplate";

const painelDoEstudanteLink: ItemMenuProps = {
  Home_Menu_Item_id: { id: 1, name: "Painel do Estudante", link: DASH, target: "_self" },
};

type DashTemplateProps = {
  className?: string;
  hasMenu?: boolean;
};

function DashTemplateContent({ hasMenu }: { hasMenu?: boolean }) {
  return (
    <div className="relative top-[76px] h-[calc(100vh-76px)] w-full flex flex-row">
      <div className="xl:mr-0 w-full overflow-y-scroll scrollbar-hide flex-1 min-w-0">
        <Outlet />
      </div>
      <div className="z-20 h-[calc(100vh-76px)] absolute xl:relative xl:right-0">
        {hasMenu && <SidebarDash />}
      </div>
      {hasMenu && (
        <SidebarTrigger className="xl:hidden fixed z-30 top-24 right-4" />
      )}
    </div>
  );
}

function DashTemplate({ className, hasMenu }: DashTemplateProps) {
  const { pathname } = useLocation();
  const isMainDash = pathname === DASH || pathname === `${DASH}/`;

  const headerValue = useMemo(() => {
    return {
      ...headerDash,
      pageLinks: isMainDash ? [] : [painelDoEstudanteLink],
    };
  }, [isMainDash]);

  return (
    <BaseTemplateContext.Provider
      value={{ header: headerValue, hasFooter: false }}
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
