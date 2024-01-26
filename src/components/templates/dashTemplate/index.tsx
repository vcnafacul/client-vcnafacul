import { VariantProps, tv } from "tailwind-variants";
import { HeaderProps } from "../../organisms/header";
import MenuDash from "../../organisms/menuDash";
import BaseTemplate from "../baseTemplate";
import { Outlet } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../../assets/icons/triangle-green.svg";

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
    header: HeaderProps;
    className?: string;
}


function DashTemplate({ header, className, hasMenu } : DashTemplateProps){
    return (
        <BaseTemplate header={header} className={`overflow-y-auto scrollbar-hide h-screen ${className}`} solid position="fixed">
            <div className={`relative top-[76px] h-[calc(100vh-76px)] w-[calc(100vw-40px)] bg-zinc-100 md:w-full`}>
                <TriangleGreen className="rotate-180 absolute left-80 w-40" />
                <div className={dashTemplate({ hasMenu })}>
                    <Outlet />
                </div>
                <div className="fixed z-10">
                    {hasMenu ? <MenuDash /> : <></>}
                </div>
            </div>
        </BaseTemplate>
    )
}

export default DashTemplate