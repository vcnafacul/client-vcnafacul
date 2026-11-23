import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  EnrollmentPeriodStatus,
  verifyEnrollmentStatus,
  VerifyEnrollmentStatusDtoOutput,
} from "@/services/prepCourse/student/verifyEnrollmentStatus";
import { useAuthStore } from "@/store/auth";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/lib/toast";

export default function EnrollmentConfirmation() {
  const {
    data: { token },
  } = useAuthStore();

  const [searchParams] = useSearchParams();

  // Token pode estar vazio para usuários não autenticados, o backend deve aceitar a consulta mesmo assim
  const authToken = token || "";

  const [cpf, setCpf] = useState("");
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyEnrollmentStatusDtoOutput | null>(
    null
  );
  const [autoVerified, setAutoVerified] = useState(false);

  // Função para formatar CPF enquanto digita
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }
    return cpf;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleEnrollmentCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEnrollmentCode(e.target.value.toUpperCase());
  };

  // Função para verificar a matrícula (reutilizável)
  const verifyEnrollment = async (cpf: string, enrollmentCode: string) => {
    // Validação básica
    const cpfNumbers = cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      toast.error("Por favor, insira um CPF válido");
      return;
    }

    if (!enrollmentCode.trim()) {
      toast.error("Por favor, insira o código de matrícula");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await verifyEnrollmentStatus(
        cpfNumbers,
        enrollmentCode.trim(),
        authToken
      );
      setResult(response);

      if (response.isEnrolled) {
        toast.success("Matrícula confirmada com sucesso!");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao verificar matrícula. Tente novamente.";
      toast.error(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyEnrollment(cpf, enrollmentCode);
  };

  // Efeito para preencher os campos com parâmetros da URL e verificar automaticamente
  useEffect(() => {
    const cpfParam = searchParams.get("cpf");
    const codigoParam = searchParams.get("codigo");

    if (cpfParam) {
      // Formatar o CPF se vier sem formatação
      const formatted = formatCPF(cpfParam);
      setCpf(formatted);
    }

    if (codigoParam) {
      setEnrollmentCode(codigoParam.toUpperCase());
    }

    // Se ambos os parâmetros estiverem presentes e ainda não verificou automaticamente
    if (cpfParam && codigoParam && !autoVerified) {
      setAutoVerified(true);
      // Usar setTimeout para garantir que os estados foram atualizados
      setTimeout(() => {
        verifyEnrollment(cpfParam, codigoParam);
      }, 500);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPeriodStatusText = (status?: EnrollmentPeriodStatus) => {
    switch (status) {
      case EnrollmentPeriodStatus.NOT_STARTED:
        return "Período ainda não iniciado";
      case EnrollmentPeriodStatus.IN_PROGRESS:
        return "Período em andamento";
      case EnrollmentPeriodStatus.FINISHED:
        return "Período finalizado";
      default:
        return "";
    }
  };

  const getPeriodStatusColor = (status?: EnrollmentPeriodStatus) => {
    switch (status) {
      case EnrollmentPeriodStatus.NOT_STARTED:
        return "bg-warning-muted border-warning text-foreground";
      case EnrollmentPeriodStatus.IN_PROGRESS:
        return "bg-success-muted border-success text-foreground";
      case EnrollmentPeriodStatus.FINISHED:
        return "bg-page border-input text-foreground";
      default:
        return "bg-info-muted border-info text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-h1 font-bold text-foreground mb-2">
              Confirmação de Matrícula
            </h1>
            <p className="text-muted-foreground text-body">
              Verifique o status da sua matrícula informando seus dados abaixo
            </p>

            {/* Indicador de verificação automática */}
            {loading && autoVerified && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-info-muted text-foreground rounded-lg text-body font-medium">
                <Spinner size="inline" decorative />
                Verificando automaticamente...
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CPF Input */}
            <div>
              <label
                htmlFor="cpf"
                className="block text-body font-semibold text-foreground mb-2"
              >
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all text-body"
                disabled={loading}
                required
              />
            </div>

            {/* Enrollment Code Input */}
            <div>
              <label
                htmlFor="enrollmentCode"
                className="block text-body font-semibold text-foreground mb-2"
              >
                Código de Matrícula
              </label>
              <input
                id="enrollmentCode"
                type="text"
                value={enrollmentCode}
                onChange={handleEnrollmentCodeChange}
                placeholder="Digite o código de matrícula"
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all text-body uppercase"
                disabled={loading}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="cta"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? "Verificando..." : "Verificar Matrícula"}
            </Button>
          </form>

          {/* Result Section */}
          {result && (
            <div className="mt-8 animate-fade-in">
              <div
                className={`p-6 border-l-4 rounded-lg ${
                  result.isEnrolled
                    ? "bg-success-muted border-success"
                    : "bg-destructive-muted border-destructive"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {result.isEnrolled ? (
                      <svg
                        className="w-6 h-6 text-success"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-destructive"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-h3 mb-2 ${
                        result.isEnrolled ? "text-success" : "text-destructive"
                      }`}
                    >
                      {result.isEnrolled
                        ? "✓ Matrícula Confirmada"
                        : "✗ Matrícula Não Encontrada"}
                    </h3>
                    <p
                      className={`text-body mb-4 ${
                        result.isEnrolled ? "text-success" : "text-destructive"
                      }`}
                    >
                      {result.message}
                    </p>

                    {/* Period Status */}
                    {result.periodStatus && (
                      <div
                        className={`inline-block px-4 py-2 rounded-lg text-body font-medium ${getPeriodStatusColor(
                          result.periodStatus
                        )} mb-4`}
                      >
                        {getPeriodStatusText(result.periodStatus)}
                      </div>
                    )}

                    {/* Course Info */}
                    {result.courseInfo && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-border">
                        <h4 className="font-semibold text-foreground mb-3">
                          Informações do Curso
                        </h4>
                        <div className="space-y-2 text-body">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            <span className="text-foreground">
                              <strong>Curso:</strong> {result.courseInfo.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-foreground">
                              <strong>Início:</strong>{" "}
                              {format(
                                new Date(result.courseInfo.startDate),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-foreground">
                              <strong>Término:</strong>{" "}
                              {format(
                                new Date(result.courseInfo.endDate),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-body text-muted-foreground">
          <p>
            Precisa de ajuda?{" "}
            <a
              href="https://vcnafacul.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-semibold underline"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
