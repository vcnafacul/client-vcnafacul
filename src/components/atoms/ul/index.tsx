import './styles.css'

interface UlProps {
    childrens: string[]
}

function Ul({childrens}: UlProps){
    return (
        <ul>
            {childrens.map((children, index) => (
                <li key={index} className="item-marker ml-4 text-start">{children}</li>
            ))}
        </ul>
    )
}

export default Ul