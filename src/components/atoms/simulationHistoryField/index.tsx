interface SimulationHistoryFieldProps {
    field: string;
    value: string;
    invert?: boolean;
    className?: string;
}

function SimulationHistoryField({field, value, invert, className} : SimulationHistoryFieldProps) {
    return ( 
        <div className={`flex gap-1 ${className}`}>
            <div className={`${!invert ? '' : 'font-bold'} text-base`}>{field}</div>
            <div className={`${invert ? '' : 'font-bold'} text-base`}>{value}</div>
        </div>
     );
}

export default SimulationHistoryField;