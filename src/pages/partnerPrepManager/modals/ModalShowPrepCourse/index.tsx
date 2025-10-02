import ModalTabTemplate from "@/components/templates/modalTabTemplate";
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
    <ModalTabTemplate
      isOpen={isOpen}
      className="p-8 rounded-md  relative h-[90vh] w-[90vw] md:w-[800px] md:h-fit overflow-y-auto scrollbar-hide"
      tabs={[
        {
          label: "Principal",
          id: "principal",
          children: (
            <ModalPrepCoursePrincipal
              prepCourse={prepCourse}
              handleClose={handleClose}
            />
          ),
        },
      ]}
    />
  );
};
