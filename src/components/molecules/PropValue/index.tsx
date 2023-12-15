import Text from "../../atoms/text"

interface PropValueProps {
    prop: string;
    value: string;
}

function PropValue({prop, value} : PropValueProps){
    return (
        <div className="flex gap-4">
            <Text className="font-black m-0" size="quaternary">{prop}: </Text>
            <Text className="m-0" size="quaternary">{value}</Text>
        </div>
    )
}

export default PropValue