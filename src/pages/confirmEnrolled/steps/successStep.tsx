import Text from "@/components/atoms/text";
import { FaCheckDouble } from "react-icons/fa";

function SuccessStep() {
  
  return (
    <div className="w-full flex flex-col items-center">
      <FaCheckDouble className="fill-green text-[150px] border-2 border-green p-4 rounded-full" />
      <Text size="secondary" className="mt-10">
        Sua solicitação foi enviada com sucesso. Após a análise da equipe do cursinho, sua matrícula será confirmada, caso os documentos enviados estejam corretos.
      </Text>
    </div>
  );
}

export default SuccessStep;
