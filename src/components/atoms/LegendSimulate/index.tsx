interface LegendSimulateProps {
    className?: string;
    label: string;
}

function LegendSimulate({ className, label } : LegendSimulateProps) {
    return (
        <>
            <div className={`w-3 h-3 rounded-full ${className}`}> </div>
            <div> {label} </div>
        </>

    )
}

export default LegendSimulate