import ModalTemplate from "@/components/templates/modalTemplate";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

export default function ConfirmSubscription({
  isOpen,
  handleClose,
  handleConfirm,
}: Props) {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-6 rounded-md max-w-lg w-full space-y-6"
    >
      <div>
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Atenção!</h2>
            <p className="text-sm text-gray-600">
              Antes de prosseguir, é importante que você esteja ciente de que
              fornecer informações falsas é crime previsto no Código Penal
              Brasileiro. Leia com atenção:
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-sm text-gray-700">
          <p className="font-medium">Código Penal – Falsidade ideológica</p>
          <p className="mt-2">
            <strong>Art. 299</strong> – Omitir, em documento público ou
            particular, declaração que dele devia constar, ou nele inserir ou
            fazer inserir declaração falsa ou diversa da que devia ser escrita,
            com o fim de prejudicar direito, criar obrigação ou alterar a
            verdade sobre fato juridicamente relevante:
          </p>
          <p className="mt-2">
            <strong>Pena:</strong> reclusão, de um a cinco anos, e multa, se o
            documento é público, e reclusão de um a três anos, e multa, se o
            documento é particular.
          </p>
          <p className="mt-2 italic">
            Parágrafo único: Se o agente é funcionário público, e comete o crime
            prevalecendo-se do cargo, ou se a falsificação ou alteração é de
            assentamento de registro civil, aumenta-se a pena de sexta parte.
          </p>
        </div>

        <p className="text-sm text-gray-600">
          Durante a declaração de interesse ou qualquer outro momento posterior,
          documentos para comprovação das informações podem ser solicitados a
          qualquer momento.
        </p>

        <div className="flex items-start gap-2 pt-4">
          <Checkbox
            id="confirmation"
            checked={isChecked}
            onCheckedChange={() => setIsChecked(!isChecked)}
          />
          <Label
            htmlFor="confirmation"
            className="text-sm text-gray-700 leading-tight"
          >
            Declaro que as informações são verdadeiras e estou ciente das
            implicações legais e da possibilidade de comprovação futura.
          </Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isChecked}>
            Confirmar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
