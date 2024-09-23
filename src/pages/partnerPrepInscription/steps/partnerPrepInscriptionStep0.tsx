import Button from "@/components/molecules/button";

interface PartnerPrepInscriptionStep0Props {
  start: () => void;
  description: string[];
}

export function PartnerPrepInscriptionStep0({
  start,
  description,
}: PartnerPrepInscriptionStep0Props) {
  return (
    <div className="flex flex-col gap-4">
      {description.map((text, index) => (
        <div key={index} className="text-base text-justify">
          {text}
        </div>
      ))}
      <Button className="mt-4" onClick={start}>
        Iniciar
      </Button>
    </div>
  );
}
