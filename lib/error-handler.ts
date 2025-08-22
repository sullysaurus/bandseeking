export interface AppError extends Error {
  code?: string
  statusCode?: number
  digest?: string
}

export class AuthenticationError extends Error {
  code = 'AUTHENTICATION_ERROR'
  statusCode = 401

  constructor(message = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class NetworkError extends Error {
  code = 'NETWORK_ERROR'
  statusCode = 500

  constructor(message = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  code = 'VALIDATION_ERROR'
  statusCode = 400

  constructor(message = 'Validation failed') {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  code = 'NOT_FOUND'
  statusCode = 404

  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export function handleSupabaseError(error: any): AppError {
  // Handle Supabase-specific errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return new NotFoundError('The requested resource was not found')
      case '23505':
        return new ValidationError('This data already exists')
      case '23503':
        return new ValidationError('Invalid reference in data')
      case '42501':
        return new AuthenticationError('Insufficient permissions')
      default:
        break
    }
  }

  // Handle Auth errors
  if (error?.message?.includes('Invalid login credentials')) {
    return new AuthenticationError('Invalid email or password')
  }

  if (error?.message?.includes('Email not confirmed')) {
    return new AuthenticationError('Please verify your email address')
  }

  if (error?.message?.includes('User already registered')) {
    return new ValidationError('An account with this email already exists')
  }

  // Handle network errors
  if (error?.message?.includes('Failed to fetch') || error?.code === 'NETWORK_ERROR') {
    return new NetworkError('Unable to connect to server. Please check your internet connection.')
  }

  // Default error
  const appError = new Error(error?.message || 'An unexpected error occurred') as AppError
  appError.code = error?.code || 'UNKNOWN_ERROR'
  appError.statusCode = error?.statusCode || 500
  
  return appError
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

export function getErrorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code)
  }
  
  return 'UNKNOWN_ERROR'
}

export function isAuthError(error: unknown): boolean {
  return error instanceof AuthenticationError || 
         getErrorCode(error) === 'AUTHENTICATION_ERROR'
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof NetworkError || 
         getErrorCode(error) === 'NETWORK_ERROR'
}

export function logError(error: unknown, context?: string) {
  const errorMessage = getErrorMessage(error)
  const errorCode = getErrorCode(error)
  
  console.error(`[${context || 'Error'}] ${errorCode}: ${errorMessage}`, error)
  
  // In production, send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // errorMonitoringService.captureException(error, { context })
  }
}

export const ErrorMessages = {
  NETWORK: 'Unable to connect. Please check your internet connection.',
  AUTH: 'Authentication failed. Please sign in again.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  PERMISSION: 'You don\'t have permission to perform this action.',
  SERVER: 'Server error. Please try again later.',
  UNKNOWN: 'Something went wrong. Please try again.',
} as const