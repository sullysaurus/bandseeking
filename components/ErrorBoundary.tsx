'use client'

import React from 'react'
import Button from '@/components/ui/Button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4 text-sm">
          We encountered an unexpected error. Please try refreshing this section.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 p-3 bg-gray-50 rounded text-left">
            <summary className="cursor-pointer text-sm font-medium">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-gray-700 overflow-auto whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
        
        <Button onClick={resetError} size="sm" className="flex items-center mx-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}

export default ErrorBoundary