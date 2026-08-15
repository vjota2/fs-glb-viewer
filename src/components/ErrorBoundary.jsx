import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, lastKey: props.resetKey };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  // Clear the failure when `resetKey` changes, so one model failing to load
  // doesn't leave the placeholder stuck on screen after switching to another.
  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.lastKey) {
      return { failed: false, lastKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error) {
    console.warn("[viewer] falling back to placeholder:", error?.message ?? error);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
