import Text from "@/components/atoms/text";
import { MoonLoader } from "react-spinners";

export default function ProcessingInvite() {
  return (
    <div className="flex flex-col justify-center items-center">
      <Text size="secondary">Aguarde enquando o convite é processado</Text>
      <MoonLoader color="#FF7600" size={60} speedMultiplier={0.4} />
    </div>
  );
}
