import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/context/ChatProvider";
import { useChatStore } from "@/store/chatStore";
import { InitiateConversationDialog } from "@/pages/admin/support/InitiateConversationDialog";
import { useSupportInboxState } from "@/hooks/useSupportInboxState";
import { useArchivedInboxState } from "@/hooks/useArchivedInboxState";
import { SupportInboxView } from "./SupportInboxView";

type Tab = "active" | "archived";

export function SupportInbox() {
  const [initiateOpen, setInitiateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [archivedEnabled, setArchivedEnabled] = useState(false);
  const { userId } = useChatContext();
  const partnerPrepId = useChatStore((s) => s.partnerPrepId);

  const activeState = useSupportInboxState(partnerPrepId);
  const archivedState = useArchivedInboxState(partnerPrepId, archivedEnabled);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "archived" && !archivedEnabled) setArchivedEnabled(true);
  }

  const current = activeTab === "active" ? activeState : archivedState;

  return (
    <>
      <SupportInboxView
        title="Suporte"
        convs={current.convs}
        sorted={current.sorted}
        selected={current.selected}
        selectedId={current.selectedId}
        onSelect={current.setSelectedId}
        onClose={() => current.setSelectedId(null)}
        search={current.search}
        onSearchChange={current.setSearch}
        userId={userId}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        archivedCount={archivedState.convs.length}
        headerActions={
          !partnerPrepId && activeTab === "active" ? (
            <Button
              type="button"
              onClick={() => setInitiateOpen(true)}
              className="bg-white text-marine hover:bg-white/90 h-8 px-3 text-xs font-semibold"
            >
              Iniciar conversa
            </Button>
          ) : undefined
        }
      />
      {!partnerPrepId && (
        <InitiateConversationDialog
          open={initiateOpen}
          onOpenChange={setInitiateOpen}
          onCreated={(id) => activeState.setSelectedId(id)}
        />
      )}
    </>
  );
}
