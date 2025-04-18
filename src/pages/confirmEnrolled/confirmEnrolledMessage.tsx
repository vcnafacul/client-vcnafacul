import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import Text from "@/components/atoms/text";

interface Props {
  children: ReactNode;
}

export default function ConfirmEnrolledExpiredMessage({ children }: Props) {
  return (
    <div className="h-[calc(100vh-88px)] flex flex-col justify-center items-center text-center px-4 space-y-6">
      <AlertCircle className="w-14 h-14 text-orange-500" />
      <h1 className="text-2xl font-semibold text-gray-800">Aviso Importante</h1>
      <Text className="max-w-xl text-gray-700" size="tertiary">
        {children}
      </Text>
    </div>
  );
}
