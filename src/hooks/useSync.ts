import { useState } from 'react'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '../lib/api'
import { useProjectStore } from '../store/project-store'

interface SyncResponse {
  success: boolean
  message: string
  syncedCount?: number
  syncId?: string
}

interface SlackSyncParams {
  channelIds: string[]
  token?: string
}

interface GitHubSyncParams {
  owner: string
  repo: string
  token?: string
  includePRs?: boolean
  includeIssues?: boolean
}

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncType, setSyncType] = useState<'slack' | 'github' | null>(null)
  const { activeContextId } = useProjectStore()

  const syncSlack = async (params: SlackSyncParams): Promise<SyncResponse> => {
    if (!params.channelIds.length) {
      toast.error('Please provide at least one channel ID')
      return { success: false, message: 'No channel IDs provided' }
    }

    // Validate channel IDs format
    const invalidChannels = params.channelIds.filter(id => !id.trim())
    if (invalidChannels.length > 0) {
      toast.error('Please provide valid channel IDs (no empty values)')
      return { success: false, message: 'Invalid channel IDs provided' }
    }

    setIsSyncing(true)
    setSyncType('slack')
    setSyncProgress(0)

    try {
      const formData = new FormData()
      formData.append('channel_ids', params.channelIds.join(','))
      formData.append('contextId', activeContextId)
      if (params.token) {
        formData.append('token', params.token)
      }

      const response = await fetch(API_ENDPOINTS.SYNC_SLACK, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = `Slack sync failed: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (jsonError) {
          // If JSON parsing fails, use the default error message
          console.warn('Failed to parse error response:', jsonError)
        }
        
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      setSyncProgress(100)
      toast.success(`Successfully synced ${data.syncedCount || 0} Slack messages`)
      
      return {
        success: true,
        message: data.message || 'Slack sync completed successfully',
        syncedCount: data.syncedCount,
        syncId: data.syncId
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Slack sync failed'
      toast.error(errorMessage)
      
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsSyncing(false)
      setSyncType(null)
      setTimeout(() => setSyncProgress(0), 1000)
    }
  }

  const syncGitHub = async (params: GitHubSyncParams): Promise<SyncResponse> => {
    if (!params.owner || !params.repo) {
      toast.error('Please provide both owner and repository name')
      return { success: false, message: 'Missing owner or repository name' }
    }

    setIsSyncing(true)
    setSyncType('github')
    setSyncProgress(0)

    try {
      const payload = {
        owner: params.owner,
        repo: params.repo,
        branch: 'main', // Default branch
        contextId: activeContextId
      }

      const response = await fetch(API_ENDPOINTS.SYNC_GITHUB, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = `GitHub sync failed: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (jsonError) {
          // If JSON parsing fails, use the default error message
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      setSyncProgress(100)
      toast.success(`Successfully synced GitHub repository: ${params.owner}/${params.repo}`)
      
      return {
        success: true,
        message: data.message || 'GitHub sync completed successfully',
        syncedCount: data.syncedCount,
        syncId: data.syncId
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub sync failed'
      toast.error(errorMessage)
      
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsSyncing(false)
      setSyncType(null)
      setTimeout(() => setSyncProgress(0), 1000)
    }
  }

  const cancelSync = async (): Promise<boolean> => {
    if (!isSyncing) return true

    try {
      const response = await fetch(API_ENDPOINTS.SYNC_CANCEL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsSyncing(false)
        setSyncType(null)
        setSyncProgress(0)
        toast.info('Sync operation cancelled')
        return true
      }
      
      return false
    } catch {
      toast.error('Failed to cancel sync operation')
      return false
    }
  }

  return {
    syncSlack,
    syncGitHub,
    cancelSync,
    isSyncing,
    syncProgress,
    syncType
  }
}