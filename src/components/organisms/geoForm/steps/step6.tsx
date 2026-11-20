import { StepProps } from ".."
import Text from "../../../atoms/text"
import { Button } from "@/components/ui/button";

interface Step6GeoProps extends StepProps {
  reset: () => void;
}

function Step6Geo({ title, subtitle, reset }: Step6GeoProps){
  return (
    <div className="my-10 z-sticky flex flex-col h-screen max-w-xl">
      <Text size="secondary">{title}</Text>
      <Text className="text-wrap mx-10" size="tertiary">{subtitle}</Text>
      <Button className="w-full" variant="primary" size="lg" onClick={reset} >Cadastre um novo cursinho</Button>
    </div>
  )
}

export default Step6Geo
