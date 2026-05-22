import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-6xl mb-4">💥</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Something went wrong
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              An unexpected error occurred.
            </p>
            <Link to="/"
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition">
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;