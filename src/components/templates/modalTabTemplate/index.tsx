import { useState } from "react";
import ModalTemplate, { ModalProps } from "../modalTemplate";

interface TabModal extends ModalProps {
  label: string;
  children: React.ReactNode;
}

interface ModalTabTemplateProps {
  tabs: TabModal[];
  isOpen: boolean;
}

function ModalTabTemplate({ tabs, isOpen }: ModalTabTemplateProps) {
  const [indexTabSelect, setIndexTabSelect] = useState<number>(0);

  return <ModalTemplate handleClose={tabs[indexTabSelect].handleClose} outSideClose isOpen={isOpen}>
    <div className="relative">
        <div className="flex -top-7 left-0 z-0">
            {tabs.map((tab, index) => (
                <div onClick={() => setIndexTabSelect(index)} key={index}
                className={`${tab.label === tabs[indexTabSelect].label ? 'bg-white' : 'bg-lightGray'} px-4 py-1 cursor-pointer`}>{tab.label}</div>
            ))}
        </div>
        <div className="bg-white max-w-7xl min-w-[90vw] md:min-w-[1000px] max-h-[90vh] p-4 top-7 overflow-y-auto scrollbar-hide">
            {tabs[indexTabSelect].children}
        </div>
    </div>
  </ModalTemplate>
}

export default ModalTabTemplate;
