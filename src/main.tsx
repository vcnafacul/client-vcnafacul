import { PrimeReactProvider } from "primereact/api";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "primereact/resources/themes/md-light-indigo/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <div className="font-raleway">
      <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </div>
);
