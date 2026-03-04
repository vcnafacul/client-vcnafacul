import DashCard from "@/components/molecules/dashCard";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
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
import { useEffect, useMemo, useState } from "react";
import { DashCardMenu } from "../../molecules/dashCard";

export function SidebarDash() {
  const [opened, setOpened] = useState<number>(0);
  const [areas, setAreas] = useState<AreaWithMaterias[] | null>(null);

  useEffect(() => {
    getMateriasGroupedByArea()
      .then(setAreas)
      .catch(() => setAreas(null));
  }, []);

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
      <SidebarHeader />
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
