/* eslint-disable @typescript-eslint/no-explicit-any */
import Text from "../../atoms/text"

interface PropValueProps {
    prop: string;
    value: any;
    className?: string;
}

function PropValue({prop, value, className} : PropValueProps){
    return (
        <div className="flex gap-x-1 md:gap-4 flex-col sm:flex-row justify-start">
            <Text className={`font-black m-0 self-start ${className}`} size="quaternary">{prop}: </Text>
            <Text className={`m-0 text-left flex items-center ${className}`} size="quaternary">{value}</Text>
        </div>
    )
}

export default PropValue