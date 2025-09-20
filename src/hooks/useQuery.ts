import { useState } from 'react'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '../lib/api'

interface Source {
  id: string
  content: string
  metadata: {
    filename?: string
    channel?: string
    pr?: string
    type: 'document' | 'slack' | 'github'
  }
}

interface QueryResponse {
  answer: string
  sources: Source[]
  confidence?: number
}

interface QueryError {
  message: string
  code?: string
}

export const useQuery = () => {
  const [isQuerying, setIsQuerying] = useState(false)
  const [lastResponse, setLastResponse] = useState<QueryResponse | null>(null)
  const [error, setError] = useState<QueryError | null>(null)

  const query = async (question: string): Promise<QueryResponse | null> => {
    if (!question.trim()) {
      toast.error('Please enter a question')
      return null
    }

    setIsQuerying(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.QUERY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Query failed: ${response.statusText}`)
      }

      const data: QueryResponse = await response.json()
      
      setLastResponse(data)
      
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Query failed'
      const queryError: QueryError = {
        message: errorMessage,
        code: error instanceof Error ? error.name : 'UNKNOWN_ERROR'
      }
      
      setError(queryError)
      toast.error(errorMessage)
      
      return null
    } finally {
      setIsQuerying(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const clearLastResponse = () => {
    setLastResponse(null)
  }

  return {
    query,
    isQuerying,
    lastResponse,
    error,
    clearError,
    clearLastResponse
  }
}