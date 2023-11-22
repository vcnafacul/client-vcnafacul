import { BrowserRouter } from "react-router-dom";
import { PlatformRoutes } from "./routes/PlatformRoutes";
import "./styles/normalize.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <PlatformRoutes/>
      </BrowserRouter>
    </>
  )
}

export default App
