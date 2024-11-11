import Text from "@/components/atoms/text";
import { BiSolidErrorAlt } from "react-icons/bi";

export default function ErrorInvite({ error }: { error: string }) {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <BiSolidErrorAlt  className="w-20 h-20 fill-redError" />
      <div>
        <Text size="secondary" className="m-0">
          Ocorreu um erro ao processar o convite.
        </Text>
        <Text size="tertiary">{error}</Text>
      </div>
    </div>
  );
}
