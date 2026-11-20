import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
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
    <div className="fixed top-0 left-0 z-overlay bg-black/50 w-screen h-screen flex justify-center items-center overflow-y-auto scrollbar-hide">
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
              className={`bg-white rounded-md ${className}`}
              key={tab.id}
              value={tab.id}
            >
              <ModalContent onClose={tab.handleClose}>
                {tab.children}
              </ModalContent>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function ModalContent({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="bg-white h-full overflow-y-auto scrollbar-hide rounded-sm flex flex-col relative border-white">
      {/* Botão de fechar fixado no topo */}
      {onClose && (
        <div className="sticky top-0 bg-white z-sticky flex items-center justify-end">
          <X
            className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground transition"
            onClick={onClose}
          />
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export default ModalTabTemplate;
