/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { AboutUsProps } from "../components/organisms/aboutUs";
import { ActionProps } from "../components/organisms/actionAreas";
import { FeaturesProps } from "../components/organisms/features";
import { SupportersSponsor, Volunteer } from "../components/organisms/supporters";

// eslint-disable-next-line react-refresh/only-export-components
const HomeContext = createContext<{
    aboutUs?: AboutUsProps| null, 
    features?: FeaturesProps| null, 
    actionAreas: ActionProps| null, 
    supporters?: SupportersSponsor| null, 
    volunteers: Volunteer[] } | null>(null)

function useHomeContext() {
    const context = useContext(HomeContext);
    if(!context) {
        throw new Error(
            "HomeContext.* component must br rendered as child of Home component"
        )
    }
    return context
}

export {
    HomeContext, useHomeContext
};
