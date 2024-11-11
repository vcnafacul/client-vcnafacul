import Text from "@/components/atoms/text";
import { FaCheckDouble } from "react-icons/fa";

export default function AcceptInvite() {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <FaCheckDouble className="w-20 h-20 fill-green" />
      <div>
        <Text size="secondary" className="m-0">
          Parabéns, convite aceito.
        </Text>
        <Text size="tertiary">
          Você será deslogado e redirecionado para a página de login.
        </Text>
      </div>
    </div>
  );
}
