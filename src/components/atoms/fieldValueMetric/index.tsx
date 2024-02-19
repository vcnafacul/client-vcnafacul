interface FieldValueMetricProps {
    field: string;
    value: string;
}

export function FieldValueMetric({ field, value } : FieldValueMetricProps) {
    return ( 
        <div className="flex gap-1">
            <div className="text-white text-sm">{field}: </div>
            <div className="text-white text-sm font-bold">{value}</div>
        </div>
     );
}

