import Text from "@/components/atoms/text";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function ConfirmEnrolledExpiredMessage({ children }: Props) {
  return (
    <div className=" h-[calc(100vh-88px)] flex flex-col justify-center items-center">
      <Text className="w-96 sm:w-[600px]" size="tertiary">
        {children}
      </Text>
    </div>
  );
}
