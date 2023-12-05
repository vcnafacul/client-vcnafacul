import { BrowserRouter } from "react-router-dom";
import { PlatformRoutes } from "./routes/PlatformRoutes";
import "./styles/normalize.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        />
      <BrowserRouter>
        <PlatformRoutes/>
      </BrowserRouter>
    </>
  )
}

export default App
