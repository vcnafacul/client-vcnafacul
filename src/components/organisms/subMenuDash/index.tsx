import SubDashCard, { SubDashCardInfo } from "../../molecules/subDashCard"


interface DashSubCardPros{
    subDashCardInfo: SubDashCardInfo[]
}

function SubMenuDash({ subDashCardInfo }: DashSubCardPros){
    return (
        <div>
            {subDashCardInfo.map(subCardInfo => (
                <SubDashCard key={subCardInfo.text} subCardInfo={subCardInfo} />
            ))}
        </div>
    )
}

export default SubMenuDash