interface SimulationHistoryFieldProps {
    field: string;
    value: string;
    invert?: boolean;
    className?: string;
}

function SimulationHistoryField({field, value, invert, className} : SimulationHistoryFieldProps) {
    return ( 
        <div className={`flex gap-1 ${className} select-none`}>
            <div className={`${!invert ? '' : 'font-bold'} text-body`}>{field}</div>
            <div className={`${invert ? '' : 'font-bold'} text-body`}>{value}</div>
        </div>
     );
}

export default SimulationHistoryField;