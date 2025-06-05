import ModalTemplate from "@/components/templates/modalTemplate";
import { getSummaryByDate } from "@/services/prepCourse/attendanceRecord/getSummaryByDate";
import { getSummaryByStudent } from "@/services/prepCourse/attendanceRecord/getSummaryByStudent";
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar } from "primereact/calendar";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";
import * as yup from "yup";
import { summaryByDate } from "../summary/summaryByDate";
import { summaryByStudent } from "../summary/summaryByStudent";

interface AttendanceRecordSummaryProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
}

export default function AttendanceRecordSummaryModal({
  isOpen,
  handleClose,
  classId,
}: AttendanceRecordSummaryProps) {
  const {
    data: { token },
  } = useAuthStore();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const end = new Date();

  const schema = yup
    .object()
    .shape({
      range: yup
        .array()
        .of(yup.date().required("Data obrigatória"))
        .length(2, "Selecione um intervalo de datas válido")
        .required("Campo obrigatório"),
      reportType: yup
        .string()
        .oneOf(["date", "student"], "Selecione o tipo de relatório")
        .required("Tipo de relatório obrigatório"),
    })
    .required();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      reportType: "date",
    },
  });

  const reportType = watch("reportType");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSummary = (data: any) => {
    const id = toast.loading("Gerando relatório ... ");
    if (data.reportType === "date") {
      getSummaryByDate(
        classId,
        data.range[0] as Date,
        data.range[1] as Date,
        token
      )
        .then((summary) => {
          summaryByDate(summary);
          toast.dismiss(id);
        })
        .catch((error) => {
          toast.update(id, {
            render: error.message,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        });
    } else if (data.reportType === "student") {
      getSummaryByStudent(
        classId,
        data.range[0] as Date,
        data.range[1] as Date,
        token
      )
        .then((summary) => {
          summaryByStudent(summary);
          toast.dismiss(id);
        })
        .catch((error) => {
          toast.update(id, {
            render: error.message,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        });
    }
  };

  useEffect(() => {
    register("range");
    register("reportType");
  }, [register]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md shadow-md"
    >
      <form
        onSubmit={handleSubmit(handleSummary)}
        className="w-full max-w-md mx-auto space-y-6"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selecione o tipo de relatório
          </label>

          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="date"
                {...register("reportType")}
                checked={reportType === "date"}
                className="form-radio"
              />
              <span>Relatório por Data</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="student"
                {...register("reportType")}
                checked={reportType === "student"}
                className="form-radio"
              />
              <span>Relatório por Estudante</span>
            </label>
          </div>

          {errors.reportType && (
            <p className="text-xs text-red font-medium text-wrap max-w-60">
              {errors.reportType.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selecione o intervalo{" "}
            <span className="text-xs text-gray-400">(máx. 30 dias)</span>
          </label>

          <div className="relative">
            <FiCalendar className="absolute top-1.5 left-3 text-gray-500 pointer-events-none" />
            <Controller
              name="range"
              control={control}
              defaultValue={[start, end]}
              render={({ field }) => (
                <Calendar
                  id="range"
                  dateFormat="dd/mm/yy"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  selectionMode="range"
                  readOnlyInput
                  hideOnRangeSelection
                  className="w-full pl-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-400"
                  maxDate={new Date()}
                />
              )}
            />
          </div>
          {errors.range && (
            <p className="text-xs text-red font-medium text-wrap max-w-60">
              {errors.range.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-marine opacity-90 hover:opacity-100 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            Gerar Relatório
          </button>
        </div>
      </form>
    </ModalTemplate>
  );
}
