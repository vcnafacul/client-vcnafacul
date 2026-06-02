import { useEffect, useState } from "react";
import { LuHeadset } from "react-icons/lu";
import { useChatContext } from "@/context/ChatProvider";
import { getMyPartnerPrepId } from "@/services/chat/getMyPartnerPrepId";
import { useAuthStore } from "@/store/auth";
import { useSupportInboxState } from "@/hooks/useSupportInboxState";
import { useArchivedInboxState } from "@/hooks/useArchivedInboxState";
import { SupportInboxView } from "./SupportInboxView";

type Tab = "active" | "archived";

export function PartnerSupportInbox() {
  const [partnerPrepId, setPartnerPrepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [archivedEnabled, setArchivedEnabled] = useState(false);
  const jwt = useAuthStore((s) => s.data.token);
  const { userId } = useChatContext();

  // Fetch the caller's cursinho ID directly from the backend — ignores token
  // claims precedence (supportAgent overrides partnerPrepId in the token).
  useEffect(() => {
    if (!jwt) return;
    setLoading(true);
    getMyPartnerPrepId(jwt)
      .then((id) => setPartnerPrepId(id))
      .finally(() => setLoading(false));
  }, [jwt]);

  const activeState = useSupportInboxState(partnerPrepId);
  const archivedState = useArchivedInboxState(partnerPrepId, archivedEnabled);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "archived" && !archivedEnabled) setArchivedEnabled(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-76px)]">
        <span className="text-sm text-grey">Carregando...</span>
      </div>
    );
  }

  if (!partnerPrepId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-76px)] gap-3">
        <LuHeadset className="h-12 w-12 text-marine/30" />
        <span className="font-medium text-marine">Nenhum cursinho associado</span>
        <span className="text-sm text-grey max-w-xs text-center">
          Sua conta não está vinculada a um cursinho parceiro.
        </span>
      </div>
    );
  }

  const current = activeTab === "active" ? activeState : archivedState;

  return (
    <SupportInboxView
      title="Suporte do Cursinho"
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
    />
  );
}
