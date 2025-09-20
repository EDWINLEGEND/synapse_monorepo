// API Configuration for Synapse Backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  : 'http://localhost:8000'

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/api/upload`,
  QUERY: `${API_BASE_URL}/api/query`,
  SYNC_SLACK: `${API_BASE_URL}/api/sync/slack`,
  SYNC_GITHUB: `${API_BASE_URL}/api/sync/github`,
  SYNC_CANCEL: `${API_BASE_URL}/api/sync/cancel`,
} as const

export { API_BASE_URL }

// Helper function for making API requests with error handling
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}