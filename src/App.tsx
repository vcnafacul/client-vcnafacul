import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CookieBar } from "./components/organisms/cookieBar";
import { ErrorBoundary } from "./components/organisms/errorBoundary";
import { PlatformRoutes } from "./routes/PlatformRoutes";
import "./styles/normalize.css";
import { GoogleMapsProvider } from "./components/molecules/googleMapsProvider/GoogleMapsProvider";
import { ChatProvider } from "./context/ChatProvider";
import { ChatWidget } from "./components/chat/ChatWidget";
import { SupportNotifier } from "./components/chat/SupportNotifier";


function App() {
  return (
    <ErrorBoundary>
      <GoogleMapsProvider>
        <ToastContainer
          // ⚠️ Toast é aviso de tela, nunca conteúdo: sem isto ele pode
          // congelar numa folha impressa.
          className="print:hidden"
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
          <ChatProvider>
            <div className="w-screen h-screen">
              <CookieBar />
              <PlatformRoutes />
              <ChatWidget />
              <SupportNotifier />
            </div>
          </ChatProvider>
        </BrowserRouter>
      </GoogleMapsProvider>
    </ErrorBoundary>
  );
}

export default App;
