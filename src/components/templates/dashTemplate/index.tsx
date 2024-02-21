import { Outlet } from "react-router-dom";
import { VariantProps, tv } from "tailwind-variants";
import { ReactComponent as TriangleGreen } from "../../../assets/icons/triangle-green.svg";
import { BaseTemplateContext } from "../../../context/baseTemplateContext";
import MenuDash from "../../organisms/menuDash";
import BaseTemplate from "../baseTemplate";
import { headerDash } from '../../../pages/dash/data'

const dashTemplate = tv({
    base: 'w-full pt-20',
    variants: {
        hasMenu: {
            true: 'md:w-[calc(100vw-250px)]',
            false: 'md-full'
        }
    },
    defaultVariants: {
        hasMenu: false
    }
})

type DashTemplateProps = VariantProps<typeof dashTemplate> & {
    className?: string;
}


function DashTemplate({  className, hasMenu } : DashTemplateProps){
    return (
        <BaseTemplateContext.Provider value={{ header: headerDash, hasFooter: false }}>
            <BaseTemplate  className={`overflow-y-auto scrollbar-hide h-screen ${className} bg-zinc-100`} solid position="fixed">
                <div className={`relative top-[76px] h-[calc(100vh-76px)] w-[calc(100vw-40px)] md:w-full`}>
                    <TriangleGreen className="rotate-180 absolute left-80 w-40" />
                    <div className={dashTemplate({ hasMenu })}>
                        <Outlet />
                    </div>
                    <div className="fixed z-10">
                        {hasMenu ? <MenuDash /> : <></>}
                    </div>
                </div>
            </BaseTemplate>
        </BaseTemplateContext.Provider>
    )
}

export default DashTemplate