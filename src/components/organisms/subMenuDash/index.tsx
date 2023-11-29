import SubDashCard, { SubDashCardInfo } from "../../molecules/subDashCard"


interface DashSubCardPros{
    subDashCardInfo: SubDashCardInfo[]
}

function SubMenuDash({ subDashCardInfo }: DashSubCardPros){
    return (
        <div>
            {subDashCardInfo.map(subCardInfo => (
                <SubDashCard subCardInfo={subCardInfo} />
            ))}
        </div>
    )
}

export default SubMenuDash