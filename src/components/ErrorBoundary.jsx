import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("[viewer] falling back to placeholder:", error?.message ?? error);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
