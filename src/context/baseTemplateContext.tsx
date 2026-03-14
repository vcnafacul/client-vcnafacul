/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { FooterProps } from "../components/organisms/footer";
import { HeaderData } from "../components/organisms/header";

 
const BaseTemplateContext = createContext<{
    header: HeaderData;
    footer?: FooterProps | null;
    hasFooter: boolean;
    /** Se false, não há novidades ativas (ocultar seção e link no header). null = ainda carregando. */
    hasNews?: boolean | null;
} | null>(null)

function useBaseTemplateContext() {
    const context = useContext(BaseTemplateContext);
    if(!context) {
        throw new Error(
            "BaseTemplateContext.* component must br rendered as child of BaseTemplate component"
        )
    }
    return context
}

export {
    BaseTemplateContext, useBaseTemplateContext
};
