import { useState } from "react";
import ModalTemplate, { ModalProps } from "../modalTemplate";

export interface TabModal extends ModalProps {
  label: string;
  children: React.ReactNode;
}

interface ModalTabTemplateProps {
  tabs: TabModal[];
  isOpen: boolean;
}

function ModalTabTemplate({ tabs, isOpen }: ModalTabTemplateProps) {
  const [indexTabSelect, setIndexTabSelect] = useState<number>(0);

  return <div>
    <ModalTemplate handleClose={tabs[indexTabSelect].handleClose!} outSideClose isOpen={isOpen} tabs={tabs} indexTabSelect={indexTabSelect} setIndexTabSelect={setIndexTabSelect}>
    <div className="relative min-h-screen md:min-h-[80vh] w-[90vw] md:w-fit">
        <div className="bg-white max-w-7xl min-w-[90vw] md:min-w-[1000px] max-h-[80vh] p-1 top-7 overflow-y-auto scrollbar-hide">
            {tabs[indexTabSelect].children}
        </div>
    </div>
  </ModalTemplate>
  </div>
}

export default ModalTabTemplate;
