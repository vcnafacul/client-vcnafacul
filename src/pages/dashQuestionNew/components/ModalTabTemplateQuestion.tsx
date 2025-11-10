import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IoMdClose } from "react-icons/io";

export interface TabModal {
  id: string;
  label: string;
  children: React.ReactNode;
  handleClose?: () => void;
}

interface ModalTabTemplateQuestionProps {
  tabs: TabModal[];
  isOpen: boolean;
  className?: string;
}

function ModalTabTemplateQuestion({
  tabs,
  isOpen,
  className,
}: ModalTabTemplateQuestionProps) {
  // Define o número de colunas baseado no número de tabs
  const gridCols =
    tabs.length <= 2
      ? "grid-cols-2"
      : tabs.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  if (!isOpen) return null;

  // Garante que sempre há um defaultValue válido
  const defaultTabId = tabs.length > 0 ? tabs[0].id : undefined;

  return (
    <div className="fixed top-0 left-0 z-50 bg-black/50 w-screen h-screen flex justify-center items-center overflow-y-auto scrollbar-hide">
      <div className="w-full h-full flex justify-center items-center p-4">
        {/* Key força re-montagem quando as tabs mudam (ex: de loading para tabs reais) */}
        <Tabs
          key={defaultTabId}
          defaultValue={defaultTabId}
          className="w-full max-w-6xl"
        >
          <TabsList className={`grid w-full ${gridCols}`}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Container com altura fixa para todas as tabs */}
          <div className="relative h-[calc(100vh-200px)]">
            {tabs.map((tab) => (
              <TabsContent
                className={`bg-white rounded-md absolute inset-0 ${className}`}
                key={tab.id}
                value={tab.id}
              >
                <ModalContent onClose={tab.handleClose}>
                  {tab.children}
                </ModalContent>
              </TabsContent>
            ))}
          </div>
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
    <div className="bg-white h-full overflow-y-auto scrollbar-hide rounded flex flex-col relative">
      {/* Botão de fechar fixado no topo */}
      {onClose && (
        <div className="sticky top-0 bg-white z-20 flex items-center justify-end p-2">
          <IoMdClose
            className="w-6 h-6 cursor-pointer text-gray-500 hover:text-gray-700 transition"
            onClick={onClose}
          />
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col gap-4 h-full">{children}</div>
    </div>
  );
}

export default ModalTabTemplateQuestion;

