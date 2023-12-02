import { HeaderProps } from "../../organisms/header";
import MenuDash from "../../organisms/menuDash";
import BaseTemplate from "../baseTemplate";

interface DashTemplateProps {
    header: HeaderProps;
    children: React.ReactNode;
    className?: string;
    hasMenu?: boolean;
}


function DashTemplate({ header, children, className, hasMenu } : DashTemplateProps){
    return (
        <BaseTemplate header={header} className={className} solid position="fixed">
            <div className={`relative top-[76px]`}>
                <div className="w-full md:w-[calc(100vw-250px)]">
                    {children}
                </div>
                <div className="fixed">
                    {hasMenu ? <MenuDash /> : <></>}
                </div>
            </div>
        </BaseTemplate>
    )
}

export default DashTemplate