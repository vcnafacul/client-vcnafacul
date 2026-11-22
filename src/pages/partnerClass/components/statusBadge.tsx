import { StatusBadge as StatusBadgeUi } from "@/components/ui/status-badge";

// Badge de status do período: dentro da tabela, com o ponto (look="dot").
export const StatusBadge = ({ active }: { active: boolean }) => (
  <StatusBadgeUi variant={active ? "success" : "neutral"} look="dot">
    {active ? "Ativo" : "Inativo"}
  </StatusBadgeUi>
);
