import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { footer, header } from "../pages/home/data";

export function BaseRoutes() {
  return (
    <BaseTemplateContext.Provider
      value={{ header, footer: footer, hasFooter: true }}
    >
      <Outlet />
    </BaseTemplateContext.Provider>
  );
}
