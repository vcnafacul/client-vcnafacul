import DashCard from "@/components/molecules/dashCard";
import { SupportInboxBadge } from "@/components/chat/SupportInboxBadge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Roles } from "@/enums/roles/roles";
import { useFetch } from "@/hooks/useFetch";
import {
  adminMenuItems,
  buildAcademicMenuItems,
  fallbackAcademicMenuItems,
  studentMenuItem,
} from "@/pages/dash/data";
import {
  AreaWithMaterias,
  getMateriasGroupedByArea,
} from "@/services/content/getMateriasGroupedByArea";
import { useAuthStore } from "@/store/auth";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { DashCardMenu } from "../../molecules/dashCard";

/**
 * ✏️ **A distância (px) entre o header e o primeiro card do menu lateral fixo** — a mesma com
 * todas as seções fechadas e com uma aberta. É aqui que se ajusta.
 */
export const DISTANCIA_DO_HEADER = 50;

/**
 * Altura do header fixo da dash. ⚠️ O mesmo 76px de `baseTemplate`/`dashTemplate` (ver o
 * comentário no `dashTemplate` sobre não unificar agora).
 */
const ALTURA_DO_HEADER = 76;

/**
 * Onde a lista do menu fixo tem de começar: logo abaixo do header + a distância.
 *
 * ⚠️ **Medido, e não somado à mão.** O menu fixo começa no TOPO da tela, embaixo do header, e
 * acima da lista há o cabeçalho do próprio menu (botão de recolher, atalho de suporte), cuja
 * altura muda com a permissão. Antes, o primeiro card ficava colado no header com tudo
 * fechado e metade escondido atrás dele com uma seção aberta. Medindo onde a lista cairia sem
 * margem, a margem que falta é exata nos dois estados.
 */
function margemDaLista(lista: HTMLElement): number {
  const atual = parseFloat(getComputedStyle(lista).marginTop) || 0;
  const semMargem = lista.getBoundingClientRect().top - atual;
  return Math.max(0, ALTURA_DO_HEADER + DISTANCIA_DO_HEADER - semMargem);
}

export function SidebarDash() {
  const [opened, setOpened] = useState<number>(0);
  const isSupportAgent = useAuthStore(
    (s) => !!s.data.permissao[Roles.supportAgent],
  );
  // Na gaveta (mobile/tablet) o atalho "Suporte" no topo só ocupa espaço: a
  // inbox já é um item do próprio menu. Fica só na sidebar fixa do desktop.
  const { isMobile } = useSidebar();

  // Só no menu FIXO: na gaveta (até tablet) o menu abre por cima de tudo, sem header em cima.
  const listaRef = useRef<HTMLUListElement>(null);
  const [margemTopo, setMargemTopo] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (isMobile) {
      setMargemTopo(null);
      return;
    }
    const medir = () => {
      if (listaRef.current) setMargemTopo(margemDaLista(listaRef.current));
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [isMobile]);

  const { data: areas } = useFetch<AreaWithMaterias[]>(
    (signal) => getMateriasGroupedByArea(signal),
    [],
  );

  const academicItems = useMemo<DashCardMenu[]>(() => {
    if (!areas) return fallbackAcademicMenuItems;
    return buildAcademicMenuItems(areas);
  }, [areas]);

  const dashCardMenuItems = useMemo(
    () => [...adminMenuItems, ...academicItems, studentMenuItem],
    [academicItems],
  );

  const selectCard = (cardId: number) => {
    setOpened(opened === cardId ? 0 : cardId);
  };
  return (
    // ⚠️ `print:hidden`: a folha impressa do relatório de simulado não leva o
    // menu lateral da dash — ele não faz sentido no papel e rouba espaço do
    // conteúdo que o coordenador quer imprimir.
    <Sidebar side="right" collapsible="icon" className="print:hidden">
      <SidebarHeader className="flex flex-row items-center justify-start pt-4 pb-2">
        <SidebarTrigger />
        {isSupportAgent && !isMobile && <SupportInboxBadge />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="overflow-y-scroll scrollbar-hide pt-0">
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenu
              ref={listaRef}
              className={`pt-0 pb-4 gap-0 ${
                // ⚠️ Sem a margem do 1º card no menu fixo: fechado ele tem `mt-4` e aberto
                // `mt-0`, e é essa diferença que fazia os dois estados ficarem em alturas
                // diferentes. O espaço até o header passa a ser todo da lista.
                isMobile ? "" : "[&>div:first-child>div:first-child]:!mt-0"
              }`}
              style={
                margemTopo !== null ? { marginTop: margemTopo } : undefined
              }
            >
              {dashCardMenuItems.map((card) => (
                <DashCard
                  onClick={() => {
                    selectCard(card.id);
                  }}
                  key={card.id}
                  card={card}
                  opened={opened === card.id}
                  size={`${
                    opened === card.id || opened === 0 ? "big" : "small"
                  }`}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
