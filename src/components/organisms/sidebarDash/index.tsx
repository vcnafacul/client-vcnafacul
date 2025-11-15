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
import { dashCardMenuItems } from "@/pages/dash/data";
import { useState } from "react";

export function SidebarDash() {
  const [opened, setOpened] = useState<number>(0);

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
