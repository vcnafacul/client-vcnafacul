import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CookieBar } from "./components/organisms/cookieBar";
import { PlatformRoutes } from "./routes/PlatformRoutes";
import "./styles/normalize.css";
import { PrimeReactProvider } from 'primereact/api';

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
      <PrimeReactProvider>
        <div className="w-screen h-screen">
          <CookieBar />
          <PlatformRoutes />
        </div>
      </PrimeReactProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
