import RenderCharts from "@/components/organisms/renderCharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";

interface StudentsInfo {
  forms: SocioeconomicAnswer[][];
  isFree: boolean[];
}

interface Props {
  geral: StudentsInfo; // Dados gerais
  enrolleds: StudentsInfo; // Dados dos matriculados
  handleClose: () => void;
}

export function Statistic({ geral, enrolleds, handleClose }: Props) {
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && handleClose()}>
      <DialogContent size="full" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Estatísticas</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="details">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="details">Todos os Alunos</TabsTrigger>
            <TabsTrigger value="enrolled">Matriculados</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <RenderCharts data={geral} />
          </TabsContent>
          <TabsContent value="enrolled">
            <RenderCharts data={enrolleds} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
