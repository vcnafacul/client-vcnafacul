/* eslint-disable @typescript-eslint/no-explicit-any */
import RadioButton from "@/components/atoms/radioButton";
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
import { TypeProblem } from "@/enums/audit/typeProblem";
import {
  reportMapHome,
  ReportMapHome,
} from "@/services/geolocation/reportMapHome";
import { Checkbox } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

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

  const sendReport = () => {
    if (message.length > 0) {
      // setError(false)
      const body: ReportMapHome = {
        entity: type,
        entityId: entityId,
        message: `${message} - Problema encontrato em ${
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
            "Sim"
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
            "Não, foi um problema na plataforma"
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white p-4 rounded-md"
    >
      <div className="bg-white max-w-5xl p-10 rounded">
        <Text size="secondary" className="text-start">
          Encontrou algum problema no Localiza Cursinho?
        </Text>
        <Text size="tertiary" className="text-start text-grey">
          Nos desculpe pelo transtorno, nos informe mais sobre o problema para a
          melhoria contínua da plataforma.
        </Text>
        <IsQuestionProblem />
        <textarea
          className="w-full border h-20 py-2 px-4"
          onChange={(event: any) => setMessage(`${event.target.value}`)}
        />
        <div className="max-w-3xl flex mx-auto gap-4 mt-4">
          <Button typeStyle="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button disabled={message.length <= 0} onClick={sendReport}>
            Enviar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ReportLC;
