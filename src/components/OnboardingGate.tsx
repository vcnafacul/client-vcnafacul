import React from "react";
import { Navigate } from "react-router-dom";
import { ONBOARDING_PATH } from "../routes/path";
import { useAuthStore } from "../store/auth";

interface OnboardingGateProps {
  children: React.ReactNode;
}

function OnboardingGate({ children }: OnboardingGateProps) {
  const { data } = useAuthStore();
  if (data.profileComplete === false) {
    return <Navigate to={ONBOARDING_PATH} replace />;
  }
  return children;
}

export default OnboardingGate;
