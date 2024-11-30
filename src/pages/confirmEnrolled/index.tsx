import { useAuthStore } from "@/store/auth";
import { ConfirmEnrolledLogin } from "./confirmEnrolledLogin";
import { ConfirmEnrolledPage } from "./confirmEnrolledPage";

export function ConfirmEnrolled() {
  const {
    data: { token },
  } = useAuthStore();

  return token ? <ConfirmEnrolledPage /> : <ConfirmEnrolledLogin />;
}
