import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/toast";
import { CookieBar } from "./components/organisms/cookieBar";
import { ErrorBoundary } from "./components/organisms/errorBoundary";
import { PlatformRoutes } from "./routes/PlatformRoutes";
import "./styles/normalize.css";
import { GoogleMapsProvider } from "./components/molecules/googleMapsProvider/GoogleMapsProvider";
import { ChatProvider } from "./context/ChatProvider";
import { ChatWidget } from "./components/chat/ChatWidget";
import { SupportNotifier } from "./components/chat/SupportNotifier";
import { PushSync } from "./components/push/PushSync";


function App() {
  return (
    <ErrorBoundary>
      <GoogleMapsProvider>
        <Toaster />
        <BrowserRouter>
          <ChatProvider>
            <div className="w-screen h-screen">
              <CookieBar />
              <PlatformRoutes />
              <ChatWidget />
              <SupportNotifier />
              <PushSync />
            </div>
          </ChatProvider>
        </BrowserRouter>
      </GoogleMapsProvider>
    </ErrorBoundary>
  );
}

export default App;
