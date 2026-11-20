import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

export default function ConfirmEnrolledExpiredMessage({ children }: Props) {
  return (
    <div className="h-[calc(100vh-theme(spacing.header))] flex flex-col justify-center items-center text-center px-4 space-y-6">
      <AlertCircle className="w-14 h-14 text-warning" />
      <h1 className="text-h1 font-semibold text-foreground">Aviso Importante</h1>
      <p className="text-body mb-6 text-center max-w-xl text-foreground">
        {children}
      </p>
    </div>
  );
}
