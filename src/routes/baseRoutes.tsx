import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { FooterProps } from "../components/organisms/footer";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { header } from "../pages/home/data";
import { getFooter } from "../services/directus/home/footer";


export function BaseRoutes() {

    const [ footer, setFooter ] = useState<FooterProps | null>(null)

    useEffect(() => {
        if(!footer) {
            getFooter()
            .then(res => {
                setFooter(res)
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }
    }, [footer])

    return (
        <BaseTemplateContext.Provider value={{ header, footer, hasFooter: true }}>
                <Outlet />
        </BaseTemplateContext.Provider>
    );
}
