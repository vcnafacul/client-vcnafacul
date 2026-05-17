import { useEffect, useState } from "react";
import { LuHeadset } from "react-icons/lu";
import { useChatContext } from "@/context/ChatProvider";
import { getMyPartnerPrepId } from "@/services/chat/getMyPartnerPrepId";
import { useAuthStore } from "@/store/auth";
import { useSupportInboxState } from "@/hooks/useSupportInboxState";
import { SupportInboxView } from "./SupportInboxView";

export function PartnerSupportInbox() {
  const [partnerPrepId, setPartnerPrepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  const { convs, sorted, selected, selectedId, setSelectedId, search, setSearch } =
    useSupportInboxState(partnerPrepId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <span className="text-sm text-grey">Carregando...</span>
      </div>
    );
  }

  if (!partnerPrepId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-3">
        <LuHeadset className="h-12 w-12 text-marine/30" />
        <span className="font-medium text-marine">Nenhum cursinho associado</span>
        <span className="text-sm text-grey max-w-xs text-center">
          Sua conta não está vinculada a um cursinho parceiro.
        </span>
      </div>
    );
  }

  return (
    <SupportInboxView
      title="Suporte do Cursinho"
      convs={convs}
      sorted={sorted}
      selected={selected}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onClose={() => setSelectedId(null)}
      search={search}
      onSearchChange={setSearch}
      userId={userId}
    />
  );
}
