import { SidebarDash } from "@/components/organisms/sidebarDash";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { BaseTemplateContext } from "../../../context/baseTemplateContext";
import { headerDash } from "../../../pages/dash/data";
import BaseTemplate from "../baseTemplate";

type DashTemplateProps = {
  className?: string;
  hasMenu?: boolean;
};

function DashTemplateContent({ hasMenu }: { hasMenu?: boolean }) {
  return (
    // ⚠️ `print:top-0 print:h-auto print:block`: zera o offset de 76px do
    // header (que já some via `print:hidden` no `Header`) e devolve o fluxo
    // normal do documento — sem isso a folha impressa mantém um vão vazio no
    // topo do tamanho do header que não está mais lá.
    //
    // ⚠️ Não unificar o 76px num token agora: ele se repete em `baseTemplate`,
    // `dashTemplate` e `DashListTemplate`, e isso é refactor de outro
    // assunto — mexer nos três aqui esconderia a mudança real na revisão.
    <div className="relative top-[76px] h-[calc(100vh-76px)] w-full flex flex-row print:top-0 print:h-auto print:block">
      <div className="xl:mr-0 w-full overflow-y-scroll scrollbar-hide flex-1 min-w-0">
        <Outlet />
      </div>
      <div className="z-20 h-[calc(100vh-76px)] absolute xl:relative xl:right-0 print:hidden">
        {hasMenu && <SidebarDash />}
      </div>
    </div>
  );
}

function DashTemplate({ className, hasMenu }: DashTemplateProps) {
  const headerValue = useMemo(
    // O "Painel do Estudante" saiu daqui: está no menu do usuário.
    () => ({ ...headerDash, pageLinks: [] }),
    [],
  );

  // ⚠️ O botão do menu lateral mora no header, não flutuando sobre a página:
  // `fixed` no canto superior direito ele cobria a ação primária das telas e,
  // sem fundo, sumia sobre topo escuro. Por isso o `SidebarProvider` envolve o
  // `BaseTemplate` — o header precisa enxergar o `toggleSidebar`. O
  // `block min-h-0` desfaz o `flex min-h-svh` do wrapper, que aqui só serve
  // de contexto, para não mexer no layout.
  const headerAction = hasMenu ? (
    <SidebarTrigger
      aria-label="Abrir menu"
      className="xl:hidden ml-1 text-marine hover:bg-marine/10 hover:text-marine print:hidden"
    />
  ) : null;

  return (
    <SidebarProvider className="block min-h-0">
      <BaseTemplateContext.Provider
        value={{ header: headerValue, hasFooter: false, headerAction }}
      >
        <BaseTemplate
          className={`overflow-y-clip scrollbar-hide h-full ${className} overflow-x-hidden`}
          solid
          position="fixed"
        >
          <DashTemplateContent hasMenu={hasMenu} />
        </BaseTemplate>
      </BaseTemplateContext.Provider>
    </SidebarProvider>
  );
}

export default DashTemplate;
