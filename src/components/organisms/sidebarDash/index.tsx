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
import { useMemo, useState } from "react";
import { DashCardMenu } from "../../molecules/dashCard";

export function SidebarDash() {
  const [opened, setOpened] = useState<number>(0);
  const isSupportAgent = useAuthStore(
    (s) => !!s.data.permissao[Roles.supportAgent],
  );

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
    <Sidebar side="right">
      <SidebarHeader>{isSupportAgent && <SupportInboxBadge />}</SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-12 overflow-y-scroll scrollbar-hide">
          <SidebarGroupContent>
            <SidebarMenu className="py-4 gap-0">
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
