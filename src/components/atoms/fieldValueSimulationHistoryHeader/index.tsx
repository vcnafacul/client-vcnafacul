interface FieldValueMetricProps {
    field: string;
    value: string;
}

export function FieldValueSimulationHistoryHeader({ field, value } : FieldValueMetricProps) {
    return ( 
        <div className="flex items-center gap-1 select-none">
            <div className="text-white text-lg">{field}: </div>
            <div className="text-white text-lg font-bold">{value}</div>
        </div>
     );
}

