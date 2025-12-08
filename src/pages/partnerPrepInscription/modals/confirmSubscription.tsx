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
      className="bg-white p-4 md:p-6 rounded-md max-w-lg w-full max-h-[80vh] overflow-y-auto"
    >
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start gap-2 md:gap-3">
          <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              Atenção!
            </h2>
            <p className="text-xs md:text-sm text-gray-600">
              Antes de prosseguir, é importante que você esteja ciente de que
              fornecer informações falsas é crime previsto no Código Penal
              Brasileiro. Leia com atenção:
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded-md text-xs md:text-sm text-gray-700">
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

        <p className="text-xs md:text-sm text-gray-600">
          Durante a declaração de interesse ou qualquer outro momento posterior,
          documentos para comprovação das informações podem ser solicitados a
          qualquer momento.
        </p>

        <div className="flex items-start gap-2 pt-2 md:pt-4">
          <Checkbox
            id="confirmation"
            checked={isChecked}
            onCheckedChange={() => setIsChecked(!isChecked)}
            className="mt-0.5"
          />
          <Label
            htmlFor="confirmation"
            className="text-xs md:text-sm text-gray-700 leading-tight cursor-pointer"
          >
            Declaro que as informações são verdadeiras e estou ciente das
            implicações legais e da possibilidade de comprovação futura.
          </Label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 md:pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isChecked}
            className="w-full sm:w-auto"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
