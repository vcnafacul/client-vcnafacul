/* eslint-disable @typescript-eslint/no-explicit-any */
import RadioButton from "@/components/atoms/radioButton";
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
import { TypeProblem } from "@/enums/audit/typeProblem";
import {
  reportMapHome,
  ReportMapHome,
} from "@/services/geolocation/reportMapHome";
import { useAuthStore } from "@/store/auth";
import { Checkbox } from "@mui/material";
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
        <span>
          {`Foi um problema com as informações ${
            type === TypeProblem.COLLEGE ? "da universidade" : "do cursinho"
          }, ${entityName}?`}
        </span>
        <div className="flex gap-4">
          <RadioButton
            onChange={() => setSelectedOption(0)}
            checked={selectedOption === 0}
          >
            Sim
          </RadioButton>
          <RadioButton
            onChange={() => {
              setSelectedOption(1);
              setAddressProblem(false);
              setContactProblem(false);
              setOtherProblem(false);
            }}
            checked={selectedOption === 1}
          >
            Não, foi um problema na plataforma
          </RadioButton>
        </div>
        <div
          className={`flex flex-col gap-0 ${
            selectedOption === 0 ? "" : "hidden"
          }`}
        >
          <div className="select-none">
            <Checkbox
              name="address"
              id="address"
              onChange={(event) => setAddressProblem(event.target.checked)}
              checked={addressProblem}
              color="primary"
            />
            <label htmlFor="address">Endereço</label>
          </div>
          <div className="select-none">
            <Checkbox
              name="contact"
              id="contact"
              onChange={(event) => setContactProblem(event.target.checked)}
              checked={contactProblem}
              color="primary"
            />
            <label htmlFor="contact">Redes Sociais e Contato</label>
          </div>
          <div className="select-none">
            <Checkbox
              name="other"
              id="other"
              onChange={(event) => setOtherProblem(event.target.checked)}
              checked={otherProblem}
              color="primary"
            />
            <label htmlFor="other">Outro</label>
          </div>
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
