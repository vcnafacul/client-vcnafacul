import { VariantProps, tv } from "tailwind-variants";
import { HeaderProps } from "../../organisms/header";
import MenuDash from "../../organisms/menuDash";
import BaseTemplate from "../baseTemplate";
import { Outlet } from "react-router-dom";

const dashTemplate = tv({
    base: 'w-full',
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
    header: HeaderProps;
    className?: string;
}


function DashTemplate({ header, className, hasMenu } : DashTemplateProps){
    return (
        <BaseTemplate header={header} className={`overflow-y-auto scrollbar-hide h-screen ${className}`} solid position="fixed">
            <div className={`relative top-[76px]`}>
                <div className={dashTemplate({ hasMenu })}>
                    <Outlet />
                </div>
                <div className="fixed">
                    {hasMenu ? <MenuDash /> : <></>}
                </div>
            </div>
        </BaseTemplate>
    )
}

export default DashTemplate