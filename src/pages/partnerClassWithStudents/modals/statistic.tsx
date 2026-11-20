import RenderCharts, {
  StudentsInfo,
} from "@/components/organisms/renderCharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StatisticModalProps {
  isOpen: boolean;
  handleClose: () => void;
  data: StudentsInfo;
}

export function StatisticModal({
  isOpen,
  handleClose,
  data,
}: StatisticModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="full" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Estatísticas</DialogTitle>
        </DialogHeader>
        <RenderCharts data={data} />
      </DialogContent>
    </Dialog>
  );
}
