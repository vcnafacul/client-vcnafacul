import { CheckCheck } from "lucide-react";

function SuccessStep() {
  
  return (
    <div className="w-full flex flex-col items-center">
      <CheckCheck size={150} className="text-success border-2 border-success p-4 rounded-full" />
      <h1 className="text-h1 text-foreground mb-6 text-center mt-10">
        Sua solicitação foi enviada com sucesso. Após a análise da equipe do cursinho, sua matrícula será confirmada, caso os documentos enviados estejam corretos.
      </h1>
    </div>
  );
}

export default SuccessStep;
