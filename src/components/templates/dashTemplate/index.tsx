import { DashCardMenu } from "../../molecules/dashCard";
import { HeaderProps } from "../../organisms/header";
import MenuDash from "../../organisms/menuDash";
import BaseTemplate from "../baseTemplate";

interface DashTemplateProps {
    header: HeaderProps;
    children: React.ReactNode;
    dashCardList?: DashCardMenu[];
    className?: string;
}


function DashTemplate({ header, children, dashCardList, className } : DashTemplateProps){
    return (
        <BaseTemplate header={header} className={className} solid position="fixed">
            <div className={`relative top-[76px]`}>
                <div className="w-full md:w-[calc(100%-250px)]">
                    {children}
                </div>
                <div className="fixed">
                    {dashCardList && dashCardList.length > 0 ? <MenuDash dashCardList={dashCardList}/> : <></>}
                </div>
            </div>
        </BaseTemplate>
    )
}

export default DashTemplate