import { PrimeReactProvider } from "primereact/api";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "primereact/resources/themes/md-light-indigo/theme.css";

const PRESERVE_KEYS = ["lgpd_status", "lgpd_updated_at"];

const storedVersion = localStorage.getItem("app-version");
if (storedVersion !== __BUILD_VERSION__) {
  const preserved = PRESERVE_KEYS.map((k) => [k, localStorage.getItem(k)]);
  localStorage.clear();
  preserved.forEach(([k, v]) => {
    if (v != null) localStorage.setItem(k!, v);
  });
  localStorage.setItem("app-version", __BUILD_VERSION__);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="font-raleway">
      <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </div>
  </React.StrictMode>
);
