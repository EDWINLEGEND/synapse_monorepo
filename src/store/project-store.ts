import { create } from 'zustand'

interface Project {
  id: string
  name: string
}

interface ActivityDetails {
  // Upload details
  fileName?: string
  fileSize?: string
  version?: string
  fileType?: string
  
  // Chat details
  topic?: string
  participants?: string
  duration?: string
  channel?: string
  
  // Sync details
  repository?: string
  branch?: string
  commits?: string
  pullRequests?: string
  
  // Meeting details
  meetingType?: string
  location?: string
  attendees?: string[]
  
  // Generic properties for extensibility
  [key: string]: unknown
}

interface Activity {
  id: string
  type: string
  icon: string
  title: string
  timestamp: Date
  description: string
  author: {
    name: string
    avatar: string
  }
  details: ActivityDetails
  message: string
  reviews: Array<{
    user: { name: string; avatar: string }
    comment: string
    timestamp: Date
  }>
}

interface ProjectStore {
  contexts: Project[]
  activeContextId: string
  selectedActivity: Activity | null
  activityDetailOpen: boolean
  setActiveContextId: (contextId: string) => void
  setSelectedActivity: (activity: Activity | null) => void
  setActivityDetailOpen: (open: boolean) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  contexts: [
    { id: 'proj_1', name: 'Synapse Project' },
    { id: 'proj_2', name: 'Demo Project' },
    { id: 'proj_3', name: 'Research Project' }
  ],
  activeContextId: 'proj_1',
  selectedActivity: null,
  activityDetailOpen: false,
  setActiveContextId: (contextId: string) => set({ activeContextId: contextId }),
  setSelectedActivity: (activity: Activity | null) => set({ selectedActivity: activity }),
  setActivityDetailOpen: (open: boolean) => set({ activityDetailOpen: open })
}))