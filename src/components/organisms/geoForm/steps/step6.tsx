import { StepProps } from ".."
import { Button } from "@/components/ui/button";

interface Step6GeoProps extends StepProps {
  reset: () => void;
}

function Step6Geo({ title, subtitle, reset }: Step6GeoProps){
  return (
    <div className="my-10 z-sticky flex flex-col h-screen max-w-xl">
      <h1 className="text-h1 text-foreground mb-6 text-center">{title}</h1>
      <p className="text-body text-foreground mb-6 text-center text-wrap mx-10">{subtitle}</p>
      <Button className="w-full" variant="primary" size="lg" onClick={reset} >Cadastre um novo cursinho</Button>
    </div>
  )
}

export default Step6Geo
