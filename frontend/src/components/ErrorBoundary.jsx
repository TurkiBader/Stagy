import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Still log it so it's visible in the browser console during development
    console.error('Caught by ErrorBoundary:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: '#eef0fb' }}
        >
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-gray-800 font-semibold mb-2">Something went wrong</p>
            <p className="text-gray-400 text-sm mb-6">
              This page hit an unexpected error. This has been logged to the console for debugging.
            </p>
            <button
              onClick={this.handleReload}
              className="text-white text-sm font-semibold px-6 py-2 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #312e81, #6d28d9)' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary