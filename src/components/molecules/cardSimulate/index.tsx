import React from "react";
import IconArea from "../../atoms/iconArea";
import Text from "../../atoms/text";
import Button from "../button";

interface CardSimulateProps {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    className?: string;
    color: string;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: (event: any) => void;
}

function CardSimulate({className, color, icon, title, children, onClick, disabled} : CardSimulateProps ){
    return (
        <div className={`mt-8 relative max-w-[400px] sm:w-80 md:w-96 pb-4 border-2 rounded-md ${className} text-marine mb-10 select-none`}>
            <div className="absolute -top-8 left-8 ">
                <IconArea icon={icon} className={`${color} fill-white`} />
            </div>
            <div className="mt-8 mx-10 text-xs flex flex-col items-start">
                <Text size="secondary" className="font-bold text-lg mb-6">{title}</Text>
                <div className="text-marine text-base text-start">{children}</div>
                <Button className={`rounded-sm ${color} border-none w-36 h-8 mt-5 hover:opacity-75 text-white`} onClick={onClick} disabled={disabled}>Iniciar</Button>
            </div>
        </div>
    )
}

export default CardSimulate