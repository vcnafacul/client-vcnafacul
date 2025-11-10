import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionDto } from "@/dtos/question/questionDTO";
import { StatusEnum } from "@/enums/generic/statusEnum";

interface ModalQuestionDetailsProps {
  question: QuestionDto | null;
  open: boolean;
  onClose: () => void;
}

const getStatusLabel = (status: StatusEnum): string => {
  switch (status) {
    case StatusEnum.Approved:
      return "Aprovado";
    case StatusEnum.Pending:
      return "Pendente";
    case StatusEnum.Rejected:
      return "Recusado";
    default:
      return "Todos";
  }
};

const getStatusColor = (
  status: StatusEnum
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case StatusEnum.Approved:
      return "default";
    case StatusEnum.Pending:
      return "secondary";
    case StatusEnum.Rejected:
      return "destructive";
    default:
      return "outline";
  }
};

export function ModalQuestionDetails({
  question,
  open,
  onClose,
}: ModalQuestionDetailsProps) {
  if (!question) return null;

  const alternativas = [
    { letra: "A", texto: question.textoAlternativaA },
    { letra: "B", texto: question.textoAlternativaB },
    { letra: "C", texto: question.textoAlternativaC },
    { letra: "D", texto: question.textoAlternativaD },
    { letra: "E", texto: question.textoAlternativaE },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-2xl">
              {question.prova.nome} - Questão #{question.numero}
            </DialogTitle>
            <Badge variant={getStatusColor(question.status)}>
              {getStatusLabel(question.status)}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Informações da Classificação */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="font-bold text-lg mb-3 text-primary">
                📋 Classificação
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Prova:
                  </span>
                  <p className="text-base">{question.prova.nome}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Número:
                  </span>
                  <p className="text-base">{question.numero}</p>
                </div>
                {question.enemArea && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Área ENEM:
                    </span>
                    <p className="text-base">{question.enemArea}</p>
                  </div>
                )}
                {question.materia && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Matéria:
                    </span>
                    <p className="text-base">{question.materia}</p>
                  </div>
                )}
                {question.frente1 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Frente Principal:
                    </span>
                    <p className="text-base">{question.frente1}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Texto da Questão */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="font-bold text-lg mb-3 text-primary">
                📝 Enunciado
              </h3>
              <p className="text-base whitespace-pre-wrap leading-relaxed">
                {question.textoQuestao}
              </p>
            </div>

            {/* Imagem da Questão */}
            {question.imageId && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-bold text-lg mb-3 text-primary">
                  🖼️ Imagem
                </h3>
                <img
                  src={`${import.meta.env.VITE_APP_URL_SIMULADO}/images/${
                    question.imageId
                  }`}
                  alt="Imagem da questão"
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Pergunta */}
            {question.pergunta && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-bold text-lg mb-3 text-primary">
                  ❓ Pergunta
                </h3>
                <p className="text-base">{question.pergunta}</p>
              </div>
            )}

            {/* Alternativas */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="font-bold text-lg mb-3 text-primary">
                ✅ Alternativas
              </h3>
              <div className="space-y-3">
                {alternativas.map((alt) => (
                  <div
                    key={alt.letra}
                    className={`p-3 rounded-md border-2 ${
                      question.alternativa === alt.letra
                        ? "bg-green-50 border-green-400"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="font-bold text-primary min-w-[24px]">
                        {alt.letra})
                      </span>
                      <span className="flex-1">{alt.texto}</span>
                      {question.alternativa === alt.letra && (
                        <Badge variant="default" className="ml-2">
                          Correta
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="font-bold text-lg mb-3 text-primary">
                📊 Estatísticas
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Acertos:
                  </span>
                  <p className="text-lg font-bold">{question.acertos || 0}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Respostas:
                  </span>
                  <p className="text-lg font-bold">
                    {question.quantidadeResposta || 0}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Simulados:
                  </span>
                  <p className="text-lg font-bold">
                    {question.quantidadeSimulado || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Revisões Necessárias */}
            {(question.provaClassification ||
              question.subjectClassification ||
              question.textClassification ||
              question.imageClassfication ||
              question.alternativeClassfication ||
              question.reported) && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-300">
                <h3 className="font-bold text-lg mb-3 text-amber-700">
                  ⚠️ Revisões Necessárias
                </h3>
                <div className="space-y-2">
                  {question.provaClassification && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Classificação de Prova</Badge>
                    </div>
                  )}
                  {question.subjectClassification && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Classificação de Disciplina e Frente
                      </Badge>
                    </div>
                  )}
                  {question.textClassification && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Texto da Questão/Alternativas
                      </Badge>
                    </div>
                  )}
                  {question.imageClassfication && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Imagem</Badge>
                    </div>
                  )}
                  {question.alternativeClassfication && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Alternativa Correta</Badge>
                    </div>
                  )}
                  {question.reported && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Reportada</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
