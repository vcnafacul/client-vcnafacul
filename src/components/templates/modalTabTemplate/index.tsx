import { useState } from "react";
import ModalTemplate from "../modalTemplate"

interface Tab {
    label: string;
    children: React.ReactNode;
}

interface ModalTabTemplateProps{
    tabs: Tab[]
}

function ModalTabTemplate({ tabs } : ModalTabTemplateProps) {
    const [tabSelect, setTabSelect] = useState<number>(0)
    return (
        <ModalTemplate>
            <div className="relative">
                <div className="flex -top-7 left-0 z-0">
                    {tabs.map((tab, index) => (
                        <div onClick={() => setTabSelect(index)} key={index} 
                        className={`${tab.label === tabs[tabSelect].label ? 'bg-white' : 'bg-lightGray'} px-4 py-1 cursor-pointer`}>{tab.label}</div>
                    ))}
                </div>
                <div className="bg-white max-w-7xl min-w-[1000px] max-h-[90vh] p-4 top-7 overflow-y-auto scrollbar-hide">
                    {tabs[tabSelect].children}
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalTabTemplate