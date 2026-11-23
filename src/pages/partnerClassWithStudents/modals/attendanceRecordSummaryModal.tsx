import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToastAsync } from "@/hooks/useToastAsync";
import { exportAttendanceRecord } from "@/services/prepCourse/attendanceRecord/exportAttendanceRecord";
import { getSummaryByDate } from "@/services/prepCourse/attendanceRecord/getSummaryByDate";
import { getSummaryByStudent } from "@/services/prepCourse/attendanceRecord/getSummaryByStudent";
import { getAlertaEvasao } from "@/services/prepCourse/alertaEvasao";
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Field } from "@/components/ui/field";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { paraIntervalo, paraPar } from "@/lib/datasBr";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { summaryByDate } from "../summary/summaryByDate";
import { summaryByStudent } from "../summary/summaryByStudent";

interface AttendanceRecordSummaryProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
  coursePeriodStart?: Date;
  coursePeriodEnd?: Date;
}

export default function AttendanceRecordSummaryModal({
  isOpen,
  handleClose,
  classId,
  coursePeriodStart,
  coursePeriodEnd,
}: AttendanceRecordSummaryProps) {
  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();
  const [isLoading, setIsLoading] = useState(false);
  /** % do alerta de risco de evasão do cursinho (tickets/054, card 05). */
  // undefined = ainda não buscou; null = sem alerta (ou falhou).
  const [padraoDoCursinho, setPadraoDoCursinho] = useState<
    number | null | undefined
  >(undefined);

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
        .oneOf(["date", "student", "excel"], "Selecione o tipo de relatório")
        .required("Tipo de relatório obrigatório"),
      maxAbsencePercent: yup.number().when("reportType", {
        is: "excel",
        then: (schema) =>
          schema.required("Informe o percentual").min(0).max(100).integer(),
        otherwise: (schema) => schema.notRequired(),
      }),
    })
    .required();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      reportType: "date",
    },
  });

  const watchReportType = watch("reportType");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSummary = async (data: any) => {
    if (data.reportType === "excel") {
      const start = data.range[0].toISOString().split("T")[0];
      const end = data.range[1].toISOString().split("T")[0];
      setIsLoading(true);
      await executeAsync({
        action: () =>
          exportAttendanceRecord(
            token,
            classId,
            start,
            end,
            data.maxAbsencePercent,
          ),
        loadingMessage: "Processando relatório ...",
        successMessage: "Relatório Excel baixado com sucesso!",
        errorMessage: (error: Error) => error.message,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (data.reportType === "date") {
      await executeAsync({
        action: () =>
          getSummaryByDate(
            classId,
            data.range[0] as Date,
            data.range[1] as Date,
            token,
          ),
        loadingMessage: "Gerando relatório ... ",
        successMessage: "Relatório gerado com sucesso!",
        errorMessage: (error: Error) => error.message,
        onSuccess: (summary) => {
          summaryByDate(summary);
        },
      });
    } else if (data.reportType === "student") {
      await executeAsync({
        action: () =>
          getSummaryByStudent(
            classId,
            data.range[0] as Date,
            data.range[1] as Date,
            token,
          ),
        loadingMessage: "Gerando relatório ... ",
        successMessage: "Relatório gerado com sucesso!",
        errorMessage: (error: Error) => error.message,
        onSuccess: (summary) => {
          summaryByStudent(summary);
        },
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    register("range");
    register("reportType");
  }, [register]);

  // O limite do Excel abre com o % do alerta de risco de evasão do cursinho,
  // como ponto de partida; continua editável. ⚠️ Não é a mesma conta da
  // chamada: o Excel usa só o intervalo escolhido, compara com ">" e não tem
  // mínimo de aulas. Busca só quando o Excel é escolhido; sem alerta (ou se a
  // leitura falhar) o campo fica como antes: vazio.
  useEffect(() => {
    if (watchReportType !== "excel" || padraoDoCursinho !== undefined) return;
    getAlertaEvasao(token)
      .then(({ percentual }) => {
        setPadraoDoCursinho(percentual);
        if (percentual == null) return;
        // Input montado e vazio vale "", não null: os dois são "não digitou".
        const atual = getValues("maxAbsencePercent") as unknown;
        if (atual == null || atual === "")
          setValue("maxAbsencePercent", percentual);
      })
      .catch(() => setPadraoDoCursinho(null));
  }, [watchReportType, padraoDoCursinho, token, getValues, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Relatório de frequência</DialogTitle>
        </DialogHeader>
        <form
          id="form-relatorio-frequencia"
          onSubmit={handleSubmit(handleSummary)}
          className="w-full space-y-6"
        >
          <div className="space-y-2">
            <span className="block text-body font-medium text-foreground">
              Selecione o tipo de relatório
            </span>

            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="date"
                  {...register("reportType")}
                  checked={watchReportType === "date"}
                  className="form-radio"
                />
                <span>Relatório por Data</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="student"
                  {...register("reportType")}
                  checked={watchReportType === "student"}
                  className="form-radio"
                />
                <span>Relatório por Estudante</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="excel"
                  {...register("reportType")}
                  checked={watchReportType === "excel"}
                  className="form-radio"
                />
                <span>Relatório Excel (Detalhado)</span>
              </label>
            </div>

            {watchReportType === "excel" && (
              <div className="mt-2">
                <label
                  htmlFor="maxAbsencePercent"
                  className="block text-body font-medium mb-1"
                >
                  Percentual máximo de faltas injustificadas (%)
                </label>
                <input
                  id="maxAbsencePercent"
                  type="number"
                  {...register("maxAbsencePercent")}
                  min={0}
                  max={100}
                  className="border rounded-sm px-3 py-2 w-24"
                  placeholder="25"
                />
                {padraoDoCursinho != null && (
                  <p className="text-caption text-muted-foreground mt-1">
                    Padrão do cursinho: {padraoDoCursinho}% (alerta de risco de
                    evasão)
                  </p>
                )}
                {errors.maxAbsencePercent && (
                  <p className="text-destructive text-body mt-1">
                    {errors.maxAbsencePercent.message}
                  </p>
                )}
              </div>
            )}

            {errors.reportType && (
              <p className="text-caption text-destructive font-medium text-wrap max-w-60">
                {errors.reportType.message}
              </p>
            )}
          </div>
          <Controller
            name="range"
            control={control}
            defaultValue={[start, end]}
            render={({ field }) => (
              <Field
                label="Selecione o intervalo"
                error={errors.range?.message}
              >
                <DateRangePicker
                  value={paraIntervalo(field.value)}
                  onChange={(r) => field.onChange(paraPar(r))}
                  min={coursePeriodStart ? new Date(coursePeriodStart) : undefined}
                  max={(() => {
                    const today = new Date();
                    const periodEnd = coursePeriodEnd
                      ? new Date(coursePeriodEnd)
                      : today;
                    return periodEnd < today ? periodEnd : today;
                  })()}
                />
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="form-relatorio-frequencia"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Gerar Relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
