import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModalProps } from "../modalTemplate";

export interface TabModal extends ModalProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

interface ModalTabTemplateProps {
  tabs: TabModal[];
  isOpen: boolean;
  className?: string;
}

function ModalTabTemplate({ tabs, isOpen, className }: ModalTabTemplateProps) {
  return !isOpen ? null : (
    <div className="fixed top-0 left-0 z-50 bg-black/50 w-screen h-screen flex justify-center items-center overflow-y-auto scrollbar-hide">
      <div className="w-full h-full flex justify-center items-center ">
        <Tabs defaultValue={tabs[0].id}>
          <TabsList className="grid w-full grid-cols-2">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent
              className={`bg-white p-4 rounded-md ${className}`}
              key={tab.id}
              value={tab.id}
            >
              {tab.children}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default ModalTabTemplate;
