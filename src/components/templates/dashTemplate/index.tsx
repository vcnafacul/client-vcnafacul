import { SidebarDash } from "@/components/organisms/sidebarDash";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../../../context/baseTemplateContext";
import { headerDash } from "../../../pages/dash/data";
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
      <div className={`md:mr-0 w-full overflow-y-scroll scrollbar-hide flex-1 pr-2 pt-6`}>
        <Outlet />
      </div>
      <div
        className={`z-20 h-[calc(100vh-76px)] absolute md:relative md:right-0 transition-all duration-200`}
      >
        {hasMenu ? <SidebarDash /> : <></>}
      </div>
      <SidebarTrigger
        className={`fixed z-30 top-20 transition-all duration-200 ${
          open ? "right-[0.5rem] md:right-[16rem]" : "right-4"
        }`}
      />
    </div>
  );
}

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
          <DashTemplateContent hasMenu={hasMenu} />
        </SidebarProvider>
      </BaseTemplate>
    </BaseTemplateContext.Provider>
  );
}

export default DashTemplate;
