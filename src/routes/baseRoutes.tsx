import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { FooterProps } from "../components/organisms/footer";
import { HeaderData } from "../components/organisms/header";
import { BaseTemplateContext } from "../context/baseTemplateContext";
import { getHeader } from "../services/directus/header";
import { getFooter } from "../services/directus/home/footer";

interface BaseRoutesProps {
    heanderIndex?: number;
}

export function BaseRoutes({ heanderIndex = 1 }: BaseRoutesProps) {

    const [ footer, setFooter ] = useState<FooterProps | null>(null)
    const [ header, setHeader ] = useState<HeaderData | null>(null)
    
    useEffect(() => {
        if(!header) {
            getHeader({ id: heanderIndex })
                .then(res => {
                    setHeader(res)
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }
    }, [header, heanderIndex])
    
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
        <BaseTemplateContext.Provider value={{ header, footer }}>
                <Outlet />
        </BaseTemplateContext.Provider>
    );
}
