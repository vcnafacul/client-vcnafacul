import Text from "@/components/atoms/text";
import { GiStoneBlock } from "react-icons/gi";

export default function NotAuth() {
  return (
    <div className="flex flex-col justify-center items-center">
      <GiStoneBlock className="w-20 h-20 fill-red" />
      <Text size="secondary">Você deve fazer o login para poder aceitar o convite.</Text>
    </div>
  )
}