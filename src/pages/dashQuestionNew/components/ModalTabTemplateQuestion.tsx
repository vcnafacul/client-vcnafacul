import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

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
  /** Botões do rodapé fixo (vão dentro do `DialogFooter`). */
  footerContent?: React.ReactNode;
  /**
   * Na barra do topo, à esquerda do fechar — a trilha da linhagem (card 34A).
   */
  cabecalho?: React.ReactNode;
  /** A aba que abre selecionada; sem ela, a primeira. */
  abaInicial?: string;
  /**
   * Aba controlada por fora (o "Ir" das pendências do conteúdo troca de aba).
   * Sem ela, as abas se controlam sozinhas, como antes.
   */
  abaAtiva?: string;
  onAbaChange?: (id: string) => void;
  /**
   * `banner` do Dialog (D21): fica sob o cabeçalho, igual em todas as abas e
   * fixo ao rolar. Hoje leva o `ErrorSummary` e o aviso de alterações não salvas.
   */
  aviso?: React.ReactNode;
}

function ModalTabTemplateQuestion({
  tabs,
  isOpen,
  className,
  footerContent,
  cabecalho,
  abaInicial,
  abaAtiva,
  onAbaChange,
  aviso,
}: ModalTabTemplateQuestionProps) {
  // Garante que sempre há uma aba válida selecionada
  const defaultTabId =
    abaInicial && tabs.some((t) => t.id === abaInicial)
      ? abaInicial
      : tabs.length > 0
        ? tabs[0].id
        : undefined;
  const controlada = abaAtiva !== undefined;
  const [interna, setInterna] = useState(defaultTabId);
  const ativa = controlada
    ? abaAtiva
    : interna && tabs.some((t) => t.id === interna)
      ? interna
      : defaultTabId;
  const trocar = (id: string) => {
    if (!controlada) setInterna(id);
    onAbaChange?.(id);
  };
  // O X e o Esc fecham pelo `handleClose` da aba em foco (cada aba decide, como antes).
  const fechar = () =>
    (tabs.find((t) => t.id === ativa) ?? tabs[0])?.handleClose?.();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(aberto) => {
        if (!aberto) fechar();
      }}
      size="full"
    >
      {/* Key força re-montagem quando as tabs mudam (ex: de loading para tabs reais) */}
      <Tabs key={defaultTabId} value={ativa} onValueChange={trocar}>
        <DialogContent
          aria-describedby={undefined}
          // Dados digitados: clique fora não fecha (R32).
          onInteractOutside={(e) => e.preventDefault()}
          banner={
            aviso ? (
              <div className="max-h-40 overflow-y-auto sm:max-h-none">{aviso}</div>
            ) : undefined
          }
          className="gap-3 p-4 sm:max-w-6xl sm:p-6"
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Questão</DialogTitle>
            {/* ⚠️ `pr-10`: a trilha da linhagem não passa por baixo do fechar. */}
            {cabecalho && <div className="min-w-0 pr-10">{cabecalho}</div>}
            {/*
              No celular, rolagem horizontal com os rótulos inteiros: seis abas
              em ~335px davam ~40px a cada uma e cortavam todos os nomes.
            */}
            <TabsList className="flex w-full justify-start overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="shrink-0 px-3">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </DialogHeader>
          <DialogBody>
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className={`mt-0 flex flex-col gap-4 data-[state=inactive]:hidden ${className ?? ""}`}
                forceMount={tab.manterMontada || undefined}
              >
                {tab.children}
              </TabsContent>
            ))}
          </DialogBody>
          {footerContent ? <DialogFooter>{footerContent}</DialogFooter> : null}
        </DialogContent>
      </Tabs>
    </Dialog>
  );
}

export default ModalTabTemplateQuestion;
