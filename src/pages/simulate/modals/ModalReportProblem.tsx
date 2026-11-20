/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReportDTO } from "../../../dtos/audit/reportDto";
import { ReportEntity } from "../../../enums/audit/reportEntity";
import { reportSimulado } from "../../../services/simulado/reportSimulado";
import { useAuthStore } from "../../../store/auth";
import { radios } from "../data";

interface ModalProps {
  handleClose?: () => void;
}

interface ModalReportProblemProps extends ModalProps {
  questionProblem: boolean;
  numberQuestion?: number;
  idQuestion?: string;
  isOpen: boolean;
}

function ModalReportProblem({
  handleClose,
  isOpen,
  questionProblem,
  numberQuestion,
  idQuestion,
}: ModalReportProblemProps) {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const {
    data: { token },
  } = useAuthStore();

  const sendReport = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (message.length > 0) {
      // setError(false)
      const body: ReportDTO = {
        entity: questionProblem ? ReportEntity.Questao : ReportEntity.Simulado,
        entityId: questionProblem ? (idQuestion as string) : "",
        message: `[${
          questionProblem
            ? selectedOption === 1
              ? radios.question.first
              : radios.question.second
            : selectedOption === 1
            ? radios.platform.first
            : radios.platform.second
        }] - ${message}`,
      };
      reportSimulado(body, token).finally(() => {
        handleClose!();
      });
    }
  };

  const IsQuestionProblem = () => {
    return questionProblem ? (
      <div>
        <p id="pergunta-questao" className="text-body mb-6 text-start text-muted-foreground">
          Foi um problema com a questão,{" "}
          <span
            className="text-foreground"
            style={{ fontSize: "16px", fontWeight: "bolder" }}
          >
            [ {numberQuestion} ]
          </span>{" "}
          ?
        </p>
        <RadioGroup
          aria-labelledby="pergunta-questao"
          className="flex flex-wrap gap-4"
          value={String(selectedOption)}
          onValueChange={(valor) => setSelectedOption(Number(valor))}
        >
          <RadioGroupItem value="0" label={radios.question.first} />
          <RadioGroupItem value="1" label={radios.question.second} />
        </RadioGroup>
      </div>
    ) : (
      <div>
        <p id="pergunta-plataforma" className="text-body text-start text-muted-foreground m-0">
          Foi um bug recorrente ou um bug que ocorreu de maneira esporádica?*
        </p>
        <RadioGroup
          aria-labelledby="pergunta-plataforma"
          className="flex flex-wrap gap-4"
          value={String(selectedOption)}
          onValueChange={(valor) => setSelectedOption(Number(valor))}
        >
          <RadioGroupItem value="0" label={radios.platform.first} />
          <RadioGroupItem value="1" label={radios.platform.second} />
        </RadioGroup>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose!()}>
      {/* tickets/059 D21: era max-w-5xl só no papel (texto, opções e uma caixa), então `lg`. R32: texto digitado, clicar fora não fecha. */}
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Ocorreu algum problema?</DialogTitle>
          <DialogDescription>
            Nos desculpe pelo transtorno, por favor, nos informe mais sobre o
            problema para a melhoria contínua da plataforma.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id="form-report-simulado" onSubmit={sendReport}>
            {IsQuestionProblem()}
            <textarea
              aria-label="Descreva o problema"
              className="w-full border h-20 py-2 px-4"
              onChange={(event: any) => setMessage(`${event.target.value}`)}
            />
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-report-simulado"
            variant="primary"
            disabled={message.length <= 0}
          >
            Reportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalReportProblem;
