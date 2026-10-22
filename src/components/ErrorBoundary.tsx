import React, { Component, ReactNode, ErrorInfo } from "react";
import Button from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
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
            backgroundColor: "#2d3439",
            color: "#ececec",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>
            Something went wrong 😢
          </h2>
          <p
            style={{
              fontSize: "1.4rem",
              color: "#aaa",
              marginBottom: "2rem",
              maxWidth: "500px",
            }}
          >
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button
            type="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/app";
            }}
          >
            Return to App
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
