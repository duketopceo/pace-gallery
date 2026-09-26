import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (message: string) => void;
}

interface State {
  failed: boolean;
}

/**
 * Last line of defence so one misbehaving vendor component cannot white-screen the page.
 *
 * This is the only class component in the repository. React exposes no hook API for error
 * boundaries, and a public marketing asset that hard-fails because a third-party scene threw
 * is a worse outcome than the one class in the tree. Everything else is functional.
 */
export class RenderBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError(`${error.message} (${(info.componentStack ?? '').trim().split('\n')[1]?.trim() ?? 'unknown site'})`);
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
