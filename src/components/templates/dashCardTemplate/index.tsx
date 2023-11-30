import Text from "../../atoms/text";
import { DashCardMenu } from "../../molecules/dashCard";
import { HeaderProps } from "../../organisms/header"
import DashTemplate from "../dashTemplate"

interface DashCardTemplateProps {
    header: HeaderProps,
    dashCardList?: DashCardMenu[]
    title: string;
    filterList: JSX.Element[]
}

function DashCardTemplate({ header, dashCardList, title, filterList}: DashCardTemplateProps) {
    return (
        <DashTemplate header={header} dashCardList={dashCardList}>
            <div className="w-full flex justify-center py-4">
                <div className="w-full flex items-center flex-col mt-4">
                    <Text size="secondary">{title}</Text>
                    <div className="w-full flex justify-center gap-20">
                        {filterList.map((filter, index) => (
                            <div key={index}>{filter}</div>
                        ))}
                    </div>
                </div>
            </div>
        </DashTemplate>
    )
}

export default DashCardTemplate