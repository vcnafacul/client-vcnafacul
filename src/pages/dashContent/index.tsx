import AllContent from "./allContent"
import OnlyDemand from "./onlyDemand"

interface DashContentProps{
    mtv: boolean //more than visualizer
}

function DashContent({mtv} : DashContentProps) {

    if(mtv){
        return (
            <AllContent />
        )
    }
    return (
        <OnlyDemand />
    )
}

export default DashContent