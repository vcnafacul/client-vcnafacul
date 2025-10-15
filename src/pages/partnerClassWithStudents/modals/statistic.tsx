import RenderCharts, {
  StudentsInfo,
} from "@/components/organisms/renderCharts";
import ModalTemplate from "@/components/templates/modalTemplate";

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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md h-[90vh] min-h-[600px] w-[95vw] overflow-y-auto scrollbar-hide"
    >
      {/* <RenderCharts data={data} /> */}
      <></>
    </ModalTemplate>
  );
}
