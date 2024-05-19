import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { header } from "../pages/home/data";
import { getFooter } from "../services/directus/home/footer";
import { useHomeStore } from "../store/home";
import { DiffTime } from "../utils/diffTime";

export function BaseRoutes() {
  const { footer, setFooter } = useHomeStore();

  useEffect(() => {
    if (!footer.data || DiffTime(footer.updated, 8)) {
      getFooter()
        .then((res) => {
          setFooter(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BaseTemplateContext.Provider
      value={{ header, footer: footer.data, hasFooter: true }}
    >
      <Outlet />
    </BaseTemplateContext.Provider>
  );
}
