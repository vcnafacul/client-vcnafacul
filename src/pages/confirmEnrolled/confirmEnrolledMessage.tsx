import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import Text from "@/components/atoms/text";

interface Props {
  children: ReactNode;
}

export default function ConfirmEnrolledExpiredMessage({ children }: Props) {
  return (
    <div className="h-[calc(100vh-theme(spacing.header))] flex flex-col justify-center items-center text-center px-4 space-y-6">
      <AlertCircle className="w-14 h-14 text-warning" />
      <h1 className="text-h1 font-semibold text-foreground">Aviso Importante</h1>
      <Text className="max-w-xl text-foreground" size="tertiary">
        {children}
      </Text>
    </div>
  );
}
