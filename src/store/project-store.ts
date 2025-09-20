import { create } from 'zustand'

interface Project {
  id: string
  name: string
}

interface ProjectStore {
  contexts: Project[]
  activeContextId: string
  setActiveContextId: (contextId: string) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  contexts: [
    { id: 'proj_1', name: 'Synapse Project' },
    { id: 'proj_2', name: 'Demo Project' },
    { id: 'proj_3', name: 'Research Project' }
  ],
  activeContextId: 'proj_1',
  setActiveContextId: (contextId: string) => set({ activeContextId: contextId })
}))