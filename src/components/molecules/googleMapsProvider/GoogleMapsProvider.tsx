import { LoadScript } from "@react-google-maps/api";
import { ReactNode } from "react";

const libraries: ("places")[] = ["places"];

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children } : GoogleMapsProviderProps) {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      {children}
    </LoadScript>
  );
}