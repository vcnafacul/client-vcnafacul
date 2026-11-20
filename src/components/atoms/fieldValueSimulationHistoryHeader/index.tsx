interface FieldValueMetricProps {
    field: string;
    value: string;
}

export function FieldValueSimulationHistoryHeader({ field, value } : FieldValueMetricProps) {
    return ( 
        <div className="flex items-center gap-1 select-none">
            <div className="text-white text-h3">{field}: </div>
            <div className="text-white text-h3 font-bold">{value}</div>
        </div>
     );
}

