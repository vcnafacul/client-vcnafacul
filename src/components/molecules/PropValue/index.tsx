import Text from "../../atoms/text"

interface PropValueProps {
    prop: string;
    value: string;
}

function PropValue({prop, value} : PropValueProps){
    return (
        <div className="flex gap-x-1 md:gap-4 flex-col sm:flex-row justify-start">
            <Text className="font-black m-0 self-start " size="quaternary">{prop}: </Text>
            <Text className="m-0 text-left" size="quaternary">{value}</Text>
        </div>
    )
}

export default PropValue