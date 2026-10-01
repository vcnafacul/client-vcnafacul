
import { PiTimerBold } from "react-icons/pi";
import Text from "../../atoms/text";
import CountdownTimer from "../../atoms/countDownTimer";
import Button from "../button";

interface HeaderSimulateProps {
    simulateName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: (event: any) => void;
}

function HeaderSimulate({ simulateName, onClick } : HeaderSimulateProps){
    return (
        // No celular quebra linha: ícone de 80px + cronômetro text-5xl + botão (~450px) passavam da tela.
        <div className="container flex justify-between items-center flex-col md:flex-row gap-3 mx-auto py-4 px-4">
            <Text size="secondary" className="text-white m-0 text-center break-words">Simulado {simulateName}</Text>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
                <PiTimerBold className="w-8 h-8 sm:w-20 sm:h-10 fill-white" />
                <CountdownTimer className="text-3xl sm:text-5xl font-black" />
                <Button onClick={onClick} className="w-full sm:w-auto">Concluir Simulado</Button>
            </div>
        </div>
    )
}

export default HeaderSimulate