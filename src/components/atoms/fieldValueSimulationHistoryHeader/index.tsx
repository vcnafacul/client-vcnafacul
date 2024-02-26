interface FieldValueMetricProps {
    field: string;
    value: string;
}

export function FieldValueSimulationHistoryHeader({ field, value } : FieldValueMetricProps) {
    return ( 
        <div className="flex gap-1 select-none">
            <div className="text-white text-sm">{field}: </div>
            <div className="text-white text-sm font-bold">{value}</div>
        </div>
     );
}

