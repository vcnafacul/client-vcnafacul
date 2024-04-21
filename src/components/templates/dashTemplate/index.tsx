import { useState } from "react";
import { Outlet } from "react-router-dom";
import { VariantProps, tv } from "tailwind-variants";
import { BaseTemplateContext } from "../../../context/baseTemplateContext";
import { headerDash } from '../../../pages/dash/data';
import MenuDash from "../../organisms/menuDash";
import BaseTemplate from "../baseTemplate";

const dashTemplate = tv({
    base: 'w-full overflow-y-scroll scrollbar-hide flex-1',
    variants: {
        hasMenu: {
            true: 'md:w-[calc(100vw-256px)]',
            false: 'md:w-full'
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
    const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false)

    const menuPosition = () => {
      if(isMenuOpened) {
          return '-right-0'
      }
      return '-right-[256px]'
    }

    return (
        <BaseTemplateContext.Provider value={{ header: headerDash, hasFooter: false }}>
            <BaseTemplate  className={`overflow-y-clip scrollbar-hide h-full w-full ${className}`} solid position="fixed">
                <div className={`relative top-[76px] h-[calc(100vh-76px)] w-full flex flex-row`}>
                    <div className={`mr-16 md:mr-0 ${dashTemplate({ hasMenu })}`}>
                        <Outlet />
                    </div>

                    <div className={`z-20 h-[calc(100vh-76px)] absolute md:relative md:right-0 md:w-64 ${menuPosition()} transition-all duration-200`}>
                        {hasMenu ? <MenuDash onMenuToggle={() => setIsMenuOpened(!isMenuOpened)} /> : <></>}
                    </div>
                </div>
            </BaseTemplate>
        </BaseTemplateContext.Provider>
    )
}

export default DashTemplate
