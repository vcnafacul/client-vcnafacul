interface LegendSimulateProps {
    className?: string;
    label: string;
}

function LegendSimulate({ className, label } : LegendSimulateProps) {
    return (
        <div className="flex justify-center items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${className}`}> </div>
            <div> {label} </div>
        </div>

    )
}

export default LegendSimulate