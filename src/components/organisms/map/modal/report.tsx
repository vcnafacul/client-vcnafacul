/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypeProblem } from "@/enums/audit/typeProblem";
import {
  reportMapHome,
  ReportMapHome,
} from "@/services/geolocation/reportMapHome";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { toast } from "react-toastify";

interface ModalProps {
  handleClose?: () => void;
}

interface ModalReportProblemProps extends ModalProps {
  isOpen: boolean;
  entityId: string;
  entityName: string;
  type: TypeProblem;
}

function ReportLC({
  entityId,
  entityName,
  type,
  handleClose,
  isOpen,
}: ModalReportProblemProps) {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [addressProblem, setAddressProblem] = useState<boolean>(false);
  const [contactProblem, setContactProblem] = useState<boolean>(false);
  const [otherProblem, setOtherProblem] = useState<boolean>(false);

  const {
    data: {
      user: { email },
    },
  } = useAuthStore();

  const sendReport = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (message.length > 0) {
      // setError(false)
      const body: ReportMapHome = {
        updatedBy: email,
        entityId: entityId,
        message: `${message} - Problema encontrado em ${
          selectedOption === 0 ? type : "Plataforma"
        }`,
        address: addressProblem,
        contact: contactProblem,
        other: otherProblem,
      };
      reportMapHome(body)
        .then(() => {
          toast.success("Report enviado com sucesso");
          handleClose!();
        })
        .catch(() => {
          toast.error("Erro ao enviar report");
        });
    }
  };

  const IsQuestionProblem = () => {
    return (
      <div>
        <span id="report-pergunta">
          {`Foi um problema com as informações ${
            type === TypeProblem.COLLEGE ? "da universidade" : "do cursinho"
          }, ${entityName}?`}
        </span>
        <RadioGroup
          aria-labelledby="report-pergunta"
          className="flex gap-4"
          value={String(selectedOption)}
          onValueChange={(valor) => {
            setSelectedOption(Number(valor));
            if (valor === "1") {
              setAddressProblem(false);
              setContactProblem(false);
              setOtherProblem(false);
            }
          }}
        >
          <RadioGroupItem value="0" label="Sim" />
          <RadioGroupItem value="1" label="Não, foi um problema na plataforma" />
        </RadioGroup>
        <div
          role="group"
          aria-label="Tipo de problema"
          className={`flex flex-col gap-0 ${
            selectedOption === 0 ? "" : "hidden"
          }`}
        >
          <Checkbox
            name="address"
            label="Endereço"
            checked={addressProblem}
            onCheckedChange={(marcado) => setAddressProblem(marcado === true)}
          />
          <Checkbox
            name="contact"
            label="Redes Sociais e Contato"
            checked={contactProblem}
            onCheckedChange={(marcado) => setContactProblem(marcado === true)}
          />
          <Checkbox
            name="other"
            label="Outro"
            checked={otherProblem}
            onCheckedChange={(marcado) => setOtherProblem(marcado === true)}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose!()}>
      {/*
        tickets/059 D21: era max-w-5xl (1024px) só no papel — o conteúdo é um texto e uma caixa —, então `lg`.
        O Dialog vai para um portal no body, acima do mapa (`isolate`). R32: texto digitado, clicar fora não fecha.
      */}
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Encontrou algum problema no Localiza Cursinho?</DialogTitle>
          <DialogDescription>
            Nos desculpe pelo transtorno, nos informe mais sobre o problema para
            a melhoria contínua da plataforma.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id="form-report-mapa" onSubmit={sendReport}>
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
            form="form-report-mapa"
            variant="primary"
            disabled={message.length <= 0}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReportLC;
