import PropValue from "@/components/molecules/PropValue";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { BsPersonVcard } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import {
  MdOutlineMoneyOffCsred,
  MdOutlinePendingActions,
} from "react-icons/md";
import { PiListChecksFill } from "react-icons/pi";
import { RiFileListFill } from "react-icons/ri";

interface Props {
  students: XLSXStudentCourseFull[];
}

export function TableInfo({ students }: Props) {
  return (
    <div className="flex flex-col sm:h-28 gap-2 flex-wrap justify-start w-fit gap-x-4 ">
      <div className="flex gap-1">
        <MdOutlinePendingActions className="h-6 w-6 fill-warning" />
        <PropValue
          className="text-body"
          prop="Em Análise"
          value={students.reduce((acc, item) => {
            if (item.status === StatusApplication.UnderReview) return acc + 1;
            return acc;
          }, 0)}
        />
      </div>
      <div className="flex gap-1">
        <PiListChecksFill className="h-6 w-6 fill-success" />
        <PropValue
          className="text-body"
          prop="A Convocar"
          value={students.reduce((acc, item) => {
            if (item.convocar === "Sim") return acc + 1;
            return acc;
          }, 0)}
        />
      </div>
      <div className="flex gap-1">
        <RiFileListFill className="h-6 w-6 fill-primary" />
        <PropValue
          className="text-body"
          prop="Lista de Espera"
          value={students.reduce((acc, item) => {
            if (item.lista_de_espera === "Sim") return acc + 1;
            return acc;
          }, 0)}
        />
      </div>
      <div className="flex gap-1">
        <FaCheck className="h-6 w-6 fill-success" />
        <PropValue
          className="text-body"
          prop="Declarou Interesse"
          value={students.reduce((acc, item) => {
            if (item.status === StatusApplication.DeclaredInterest)
              return acc + 1;
            return acc;
          }, 0)}
        />
      </div>
      <div className="flex gap-1">
        <MdOutlineMoneyOffCsred className="h-6 w-6 fill-success" />
        <PropValue
          className="text-body"
          prop="Isentos Matriculados"
          value={students.reduce((acc, item) => {
            if (
              item.isento === "Sim" &&
              item.status === StatusApplication.Enrolled
            )
              return acc + 1;
            return acc;
          }, 0)}
        />
      </div>
      <div className="flex gap-1">
        <BsPersonVcard className="h-6 w-6 fill-chart-4" />
        <PropValue
          className="text-body"
          prop="Matriculados"
          value={students.reduce((acc, item) => {
            if (item.status === StatusApplication.Enrolled) return acc + 1;
            return acc;
          }, 0)}
        />
      </div>
    </div>
  );
}
