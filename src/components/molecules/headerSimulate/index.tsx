
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
        <div className="bg-marine">
            <div className="container flex justify-between items-center flex-col md:flex-row mx-auto py-4">
                <Text size="secondary" className="text-white m-0">Simulado {simulateName}</Text>
                <div className="flex items-center gap-4">
                    <PiTimerBold className="w-20 h-10 fill-white" />
                    <CountdownTimer className="text-5xl font-black" />
                    <Button onClick={onClick}>Concluir Simulado</Button>
                </div>
            </div>
        </div>
    )
}

export default HeaderSimulate