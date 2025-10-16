import RenderCharts from "@/components/organisms/renderCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";
import { IoMdClose } from "react-icons/io";

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
    <div className="absolute w-screen h-screen bg-black/60 z-50 -top-[76px] left-0 flex justify-center items-center">
      <div className="w-full h-full flex justify-center items-center md:py-4">
        <Tabs defaultValue="details" className="w-full max-w-[90vw] h-[80vh]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Todos os Alunos</TabsTrigger>
            <TabsTrigger value="enrolled">Matriculados</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="h-full">
            <ModalContent onClose={handleClose}>
              <></>
              <RenderCharts data={geral} />
            </ModalContent>
          </TabsContent>
          <TabsContent value="enrolled" className="h-full">
            <ModalContent onClose={handleClose}>
              <></>
              <RenderCharts data={enrolleds} />
            </ModalContent>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ModalContent({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="bg-white h-full overflow-y-auto scrollbar-hide rounded pb-2 px-2 flex flex-col gap-4 relative border-8 border-white">
      <div className="sticky top-0 bg-white z-20 flex items-center justify-end p-2">
        <IoMdClose
          className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        />
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
