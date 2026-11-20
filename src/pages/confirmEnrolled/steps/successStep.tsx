import Text from "@/components/atoms/text";
import { CheckCheck } from "lucide-react";

function SuccessStep() {
  
  return (
    <div className="w-full flex flex-col items-center">
      <CheckCheck size={150} className="text-success border-2 border-success p-4 rounded-full" />
      <Text size="secondary" className="mt-10">
        Sua solicitação foi enviada com sucesso. Após a análise da equipe do cursinho, sua matrícula será confirmada, caso os documentos enviados estejam corretos.
      </Text>
    </div>
  );
}

export default SuccessStep;
