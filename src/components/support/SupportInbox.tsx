import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/context/ChatProvider";
import { useChatStore } from "@/store/chatStore";
import { InitiateConversationDialog } from "@/pages/admin/support/InitiateConversationDialog";
import { useSupportInboxState } from "@/hooks/useSupportInboxState";
import { SupportInboxView } from "./SupportInboxView";

export function SupportInbox() {
  const [initiateOpen, setInitiateOpen] = useState(false);
  const { userId } = useChatContext();
  const partnerPrepId = useChatStore((s) => s.partnerPrepId);
  const { convs, sorted, selected, selectedId, setSelectedId, search, setSearch } =
    useSupportInboxState(partnerPrepId);

  return (
    <>
      <SupportInboxView
        title="Suporte"
        convs={convs}
        sorted={sorted}
        selected={selected}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onClose={() => setSelectedId(null)}
        search={search}
        onSearchChange={setSearch}
        userId={userId}
        headerActions={
          !partnerPrepId ? (
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
          onCreated={(id) => setSelectedId(id)}
        />
      )}
    </>
  );
}
