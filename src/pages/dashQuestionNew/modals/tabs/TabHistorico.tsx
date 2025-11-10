import { TabHistoricoRefactored } from "./TabHistoricoRefactored";

interface TabHistoricoProps {
  questionId: string;
}

export function TabHistorico({ questionId }: TabHistoricoProps) {
  return <TabHistoricoRefactored questionId={questionId} />;
}
