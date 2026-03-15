import { Component, ErrorInfo, ReactNode } from "react";
import {
  buildFrontendErrorPayload,
  sendFrontendError,
} from "@/utils/sendFrontendError";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const payload = buildFrontendErrorPayload({
      errorType: "UNHANDLED_ERROR",
      message: error.message,
      origin: "ErrorBoundary",
      errorDetail: [error.stack, info.componentStack].filter(Boolean).join("\n\n"),
    });
    sendFrontendError(payload);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "1rem",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
            Algo deu errado
          </h1>
          <p style={{ color: "#666", margin: 0 }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#1a73e8",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
