
import { Timer } from "lucide-react";
import CountdownTimer from "../../atoms/countDownTimer";
import { Button } from "@/components/ui/button";

interface HeaderSimulateProps {
    simulateName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: (event: any) => void;
}

function HeaderSimulate({ simulateName, onClick } : HeaderSimulateProps){
    return (
        // No celular quebra linha: ícone de 80px + cronômetro text-5xl + botão (~450px) passavam da tela.
        <div className="container flex justify-between items-center flex-col md:flex-row gap-3 mx-auto py-4 px-4">
            <h1 className="text-h1 text-white m-0 text-center break-words">Simulado {simulateName}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Timer className="w-8 h-8 sm:w-20 sm:h-10 text-white" />
                <CountdownTimer className="text-h1 font-extrabold" />
                <Button variant="primary" size="lg" onClick={onClick} className="w-full sm:w-auto">Concluir Simulado</Button>
            </div>
        </div>
    )
}

export default HeaderSimulate