import { StepProps } from ".."
import Text from "../../../atoms/text"
import Button from "../../../molecules/button"

interface Step6GeoProps extends StepProps {
  reset: () => void;
}

function Step6Geo({ title, subtitle, reset }: Step6GeoProps){
  return (
    <div className="my-10 z-20 flex flex-col h-screen max-w-xl">
      <Text size="secondary">{title}</Text>
      <Text className="text-wrap mx-10" size="tertiary">{subtitle}</Text>
      <Button onClick={reset} >Cadastre um novo cursinho</Button>
    </div>
  )
}

export default Step6Geo
