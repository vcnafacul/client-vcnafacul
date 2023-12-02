import LegendSimulate from "../../atoms/LegendSimulate"

interface Legend {
    label: string;
    className: string;
}

interface LegendsProps {
    legends: Legend[]
}
function Legends({legends} : LegendsProps) {
    return (
        <div className="flex items-center gap-2 container mx-auto my-4">
            {legends.map((legend, index) => (
                <LegendSimulate key={index} label={legend.label} className={legend.className} />
            ))}
        </div>
    )
}

export default Legends