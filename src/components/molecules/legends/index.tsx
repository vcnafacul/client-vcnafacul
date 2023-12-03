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
        <div className="flex items-center gap-2 container mx-4 sm:mx-auto my-4 flex-wrap">
            {legends.map((legend, index) => (
                <LegendSimulate key={index} label={legend.label} className={legend.className} />
            ))}
        </div>
    )
}

export default Legends