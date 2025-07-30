import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class CollegeListErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CollegeList Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-4">
            Unable to load colleges. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-3"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CollegeListErrorBoundary;
