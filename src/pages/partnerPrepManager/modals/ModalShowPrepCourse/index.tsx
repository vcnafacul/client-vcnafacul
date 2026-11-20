import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ModalPrepCoursePrincipal,
  ModalPrincipalProps,
} from "./modalPrepCoursePrincipal";

interface ModalShowPrepCourseProps extends ModalPrincipalProps {
  isOpen: boolean;
}

export const ModalShowPrepCourse = ({
  isOpen,
  handleClose,
  prepCourse,
}: ModalShowPrepCourseProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      {/* R32: o formulário de edição perde o digitado num clique fora. */}
      <DialogContent
        size="lg"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Tabs defaultValue="principal">
          <TabsList>
            <TabsTrigger value="principal">Principal</TabsTrigger>
          </TabsList>
          <TabsContent value="principal">
            <ModalPrepCoursePrincipal prepCourse={prepCourse} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
