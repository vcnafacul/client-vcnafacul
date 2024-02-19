/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { FooterProps } from "../components/organisms/footer";
import { HeaderData } from "../components/organisms/header";

// eslint-disable-next-line react-refresh/only-export-components
const BaseTemplateContext = createContext<{
    header:HeaderData, 
    footer?: FooterProps | null } | null>(null)

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
