import { SidebarDash } from "@/components/organisms/sidebarDash";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../../../context/baseTemplateContext";
import { headerDash } from "../../../pages/dash/data";
import BaseTemplate from "../baseTemplate";

type DashTemplateProps = {
  className?: string;
  hasMenu?: boolean;
};

function DashTemplate({ className, hasMenu }: DashTemplateProps) {
  return (
    <BaseTemplateContext.Provider
      value={{ header: headerDash, hasFooter: false }}
    >
      <BaseTemplate
        className={`overflow-y-clip scrollbar-hide h-full ${className} overflow-x-hidden`}
        solid
        position="fixed"
      >
        <SidebarProvider>
          <div
            className={`relative top-[76px] h-[calc(100vh-76px)] w-full flex flex-row`}
          >
            <div
              className={`md:mr-0 w-full overflow-y-scroll scrollbar-hide flex-1`}
            >
              <Outlet />
            </div>
            <SidebarTrigger />
            <div
              className={`z-20 h-[calc(100vh-76px)] absolute md:relative md:right-0 transition-all duration-200`}
            >
              {hasMenu ? <SidebarDash /> : <></>}
            </div>
          </div>
        </SidebarProvider>
      </BaseTemplate>
    </BaseTemplateContext.Provider>
  );
}

export default DashTemplate;
