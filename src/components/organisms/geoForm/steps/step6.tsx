import { StepProps } from ".."
import Text from "../../../atoms/text"
import BLink from "../../../molecules/bLink"

function Step6Geo({ title, subtitle }: StepProps){
  return (
    <div className="my-10 z-20 flex flex-col my-20 h-screen max-w-xl">
      <Text size="secondary">{title}</Text>
      <Text className="text-wrap mx-10" size="tertiary">{subtitle}</Text>
      <BLink to="/" >Cadastre um novo cursinho</BLink>
    </div>
  )
}

export default Step6Geo
