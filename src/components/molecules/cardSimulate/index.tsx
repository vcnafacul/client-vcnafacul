import React from "react";
import Text from "../../atoms/text";
import Button from "../button";
import IconArea from "../../atoms/iconArea";

interface CardSimulateProps {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    className?: string;
    color: string;
    title: string;
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: (event: any) => void;
}

function CardSimulate({className, color, icon, title, children, onClick} : CardSimulateProps ){
    return (
        <div className={`mt-8 relative w-96 pb-4 border-2 rounded-md ${className} text-marine mb-10`}>
            <IconArea icon={icon} className={`absolute -top-8 left-8 ${color}`} />
            <div className="mt-10 ml-10 flex flex-col items-start">
                <Text size="secondary" className="font-bold">{title}</Text>
                <div className="text-marine text-base">{children}</div>
                <Button className={`rounded-sm ${color} border-none w-40 mt-5 hover:opacity-75`} onClick={onClick}>Iniciar</Button>
            </div>
        </div>
    )
}

export default CardSimulate