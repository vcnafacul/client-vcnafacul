/* eslint-disable @typescript-eslint/no-explicit-any */

interface PropValueProps {
    prop: string;
    value: any;
    className?: string;
}

function PropValue({prop, value, className} : PropValueProps){
    return (
        <div className="flex gap-x-1 md:gap-4 flex-wrap justify-start">
            <p className={`text-body font-extrabold m-0 flex items-center text-center ${className}`}>{prop}: </p>
            <p className={`text-body m-0 text-left flex items-center ${className}`}>{value}</p>
        </div>
    )
}

export default PropValue