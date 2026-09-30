import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IoMdClose } from "react-icons/io";

export interface TabModal {
  id: string;
  label: string;
  children: React.ReactNode;
  handleClose?: () => void;
  /**
   * Mantém a aba montada quando outra é selecionada (só a esconde). Sem isso
   * o Radix desmonta a aba e o que estava sendo editado nela se perde.
   */
  manterMontada?: boolean;
}

interface ModalTabTemplateQuestionProps {
  tabs: TabModal[];
  isOpen: boolean;
  className?: string;
  footerContent?: React.ReactNode;
  /**
   * Na barra do topo, à esquerda do fechar — a trilha da linhagem (card 34A).
   */
  cabecalho?: React.ReactNode;
  /** A aba que abre selecionada; sem ela, a primeira. */
  abaInicial?: string;
}

function ModalTabTemplateQuestion({
  tabs,
  isOpen,
  className,
  footerContent,
  cabecalho,
  abaInicial,
}: ModalTabTemplateQuestionProps) {
  if (!isOpen) return null;

  // Garante que sempre há um defaultValue válido
  const defaultTabId =
    abaInicial && tabs.some((t) => t.id === abaInicial)
      ? abaInicial
      : tabs.length > 0
        ? tabs[0].id
        : undefined;

  return (
    <div className="fixed top-0 left-0 z-50 bg-black/50 w-screen h-screen flex justify-center items-center overflow-y-auto scrollbar-hide">
      <div className="w-full h-full flex justify-center items-center p-2 sm:p-4">
        {/* Key força re-montagem quando as tabs mudam (ex: de loading para tabs reais) */}
        <Tabs
          key={defaultTabId}
          defaultValue={defaultTabId}
          className="w-full max-w-6xl"
        >
          {/* Colunas geradas dinamicamente: sempre 1 coluna por aba, todas
              com a mesma largura (minmax(0,1fr) permite encolher). Assim as
              abas ficam sempre em uma única linha horizontal, diminuindo de
              tamanho conforme mais abas são adicionadas. */}
          {/*
            ⚠️ No celular, rolagem horizontal com os rótulos inteiros: seis abas
            em ~335px davam ~40px a cada uma e cortavam todos os nomes.
          */}
          <TabsList
            className="flex w-full justify-start overflow-x-auto scrollbar-hide sm:grid"
            style={{
              gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            }}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="shrink-0 px-3 sm:shrink sm:min-w-0 sm:px-2 sm:overflow-hidden sm:text-ellipsis"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Container com altura fixa para todas as tabs */}
          {/*
            `dvh` desconta a barra do navegador no celular (sem suporte, vh).
            No celular sobra menos margem em volta, então a caixa é mais alta.
          */}
          <div className="relative h-[calc(100vh-200px)] supports-[height:100dvh]:h-[calc(100dvh-110px)] sm:supports-[height:100dvh]:h-[calc(100dvh-200px)]">
            {tabs.map((tab) => (
              <TabsContent
                className={`bg-white rounded-md absolute inset-0 data-[state=inactive]:hidden ${className}`}
                key={tab.id}
                value={tab.id}
                forceMount={tab.manterMontada || undefined}
              >
                <ModalContent
                  onClose={tab.handleClose}
                  footer={footerContent}
                  cabecalho={cabecalho}
                >
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
  footer,
  cabecalho,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
  cabecalho?: React.ReactNode;
}) {
  return (
    <div className="bg-white h-full overflow-y-auto scrollbar-hide rounded flex flex-col relative">
      {/* Botão de fechar fixado no topo */}
      {onClose && (
        <div className="sticky top-0 bg-white z-20 flex items-center justify-end gap-2 p-2">
          {/* ⚠️ `mr-auto`: a trilha à esquerda, o fechar no canto de sempre. */}
          {cabecalho && <div className="mr-auto min-w-0">{cabecalho}</div>}
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="shrink-0 rounded text-gray-500 hover:text-gray-700 transition"
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col gap-4 flex-1">{children}</div>

      {/* Footer fixado no final */}
      {footer && (
        <div className="sticky bottom-0 bg-white z-20 border-t">
          {footer}
        </div>
      )}
    </div>
  );
}

export default ModalTabTemplateQuestion;

