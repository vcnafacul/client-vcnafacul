import Button from "@/components/molecules/button";
import {
  EnrollmentPeriodStatus,
  verifyEnrollmentStatus,
  VerifyEnrollmentStatusDtoOutput,
} from "@/services/prepCourse/student/verifyEnrollmentStatus";
import { useAuthStore } from "@/store/auth";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

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
        return "bg-yellow-50 border-yellow-500 text-yellow-800";
      case EnrollmentPeriodStatus.IN_PROGRESS:
        return "bg-green-50 border-green-500 text-green-800";
      case EnrollmentPeriodStatus.FINISHED:
        return "bg-gray-50 border-gray-500 text-gray-800";
      default:
        return "bg-blue-50 border-blue-500 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-fuchsia-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-fuchsia-600"
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Confirmação de Matrícula
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Verifique o status da sua matrícula informando seus dados abaixo
            </p>

            {/* Indicador de verificação automática */}
            {loading && autoVerified && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
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
                className="block text-sm font-semibold text-gray-700 mb-2"
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all text-base"
                disabled={loading}
                required
              />
            </div>

            {/* Enrollment Code Input */}
            <div>
              <label
                htmlFor="enrollmentCode"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Código de Matrícula
              </label>
              <input
                id="enrollmentCode"
                type="text"
                value={enrollmentCode}
                onChange={handleEnrollmentCodeChange}
                placeholder="Digite o código de matrícula"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all text-base uppercase"
                disabled={loading}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              typeStyle="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verificando...
                </span>
              ) : (
                "Verificar Matrícula"
              )}
            </Button>
          </form>

          {/* Result Section */}
          {result && (
            <div className="mt-8 animate-fade-in">
              <div
                className={`p-6 border-l-4 rounded-lg ${
                  result.isEnrolled
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {result.isEnrolled ? (
                      <svg
                        className="w-6 h-6 text-green-600"
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
                        className="w-6 h-6 text-red-600"
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
                      className={`font-bold text-lg mb-2 ${
                        result.isEnrolled ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.isEnrolled
                        ? "✓ Matrícula Confirmada"
                        : "✗ Matrícula Não Encontrada"}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${
                        result.isEnrolled ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.message}
                    </p>

                    {/* Period Status */}
                    {result.periodStatus && (
                      <div
                        className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${getPeriodStatusColor(
                          result.periodStatus
                        )} mb-4`}
                      >
                        {getPeriodStatusText(result.periodStatus)}
                      </div>
                    )}

                    {/* Course Info */}
                    {result.courseInfo && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Informações do Curso
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
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
                            <span className="text-gray-700">
                              <strong>Curso:</strong> {result.courseInfo.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
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
                            <span className="text-gray-700">
                              <strong>Início:</strong>{" "}
                              {format(
                                new Date(result.courseInfo.startDate),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
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
                            <span className="text-gray-700">
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
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Precisa de ajuda?{" "}
            <a
              href="https://vcnafacul.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-600 hover:text-fuchsia-700 font-semibold underline"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
