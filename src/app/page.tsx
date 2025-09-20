'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TimelineItem } from '@/components/timeline-item'
import { ActivityDetail } from '@/components/activity-detail'
import { useProjectStore } from '@/store/project-store'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Menu,
  X,
  Filter,
  FolderOpen
} from 'lucide-react'

// Mock activity data with expanded fields for timeline
const mockActivities = [
  {
    id: 'act_001',
    type: 'upload',
    icon: 'upload',
    title: 'Uploaded project documentation',
    description: 'Added comprehensive project documentation including API specs and user guides',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    author: {
      name: 'Alex Ray',
      avatar: '/avatars/alex.png'
    },
    details: {
      fileName: 'project-documentation.pdf',
      fileSize: '2.4 MB',
      version: 'v3.1',
      fileType: 'PDF Document'
    },
    message: 'Here is the latest version of the project documentation including comprehensive API specifications and user guides. This update includes new sections on authentication and error handling.',
    reviews: [
      {
        user: { name: 'Samira Khan', avatar: '/avatars/samira.png' },
        comment: 'Excellent documentation! The API specs are very clear and comprehensive.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        user: { name: 'Jordan Lee', avatar: '/avatars/jordan.png' },
        comment: 'Great work on the user guides section. Very helpful for onboarding.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      }
    ]
  },
  {
    id: 'act_002',
    type: 'chat',
    icon: 'chat',
    title: 'Started new conversation',
    description: 'Initiated discussion about implementation strategies for the new feature set',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    author: {
      name: 'Maya Patel',
      avatar: '/avatars/maya.png'
    },
    details: {
      topic: 'Implementation Strategies Discussion',
      participants: '5',
      duration: '32 minutes',
      channel: '#development'
    },
    message: 'Started a comprehensive discussion about the best approaches for implementing the new feature set. We need to consider scalability, performance, and maintainability.',
    reviews: [
      {
        user: { name: 'Alex Ray', avatar: '/avatars/alex.png' },
        comment: 'Great points about scalability. We should definitely consider microservices.',
        timestamp: new Date(Date.now() - 40 * 60 * 1000)
      }
    ]
  },
  {
    id: 'act_003',
    type: 'sync',
    icon: 'sync',
    title: 'Synced GitHub repository',
    description: 'Successfully synchronized latest commits and pull requests from main branch',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    author: {
      name: 'DevOps Bot',
      avatar: '/avatars/bot.png'
    },
    details: {
      repository: 'synapse-v2',
      branch: 'main',
      commits: '12',
      pullRequests: '3',
      status: 'Success'
    },
    message: 'Automated synchronization completed successfully. All latest commits and pull requests have been processed and indexed for the knowledge base.',
    reviews: []
  },
  {
    id: 'act_004',
    type: 'meeting',
    icon: 'meeting',
    title: 'Team standup completed',
    description: 'Discussed sprint progress and identified potential blockers for upcoming tasks',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    author: {
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.png'
    },
    details: {
      meetingType: 'Daily Standup',
      attendees: ['Alex Ray', 'Maya Patel', 'Jordan Lee', 'Samira Khan', 'Sarah Chen'],
      duration: '25 minutes',
      location: 'Conference Room A / Zoom',
      agenda: 'Sprint progress review and blocker identification'
    },
    message: 'Productive standup meeting where we reviewed current sprint progress. Team is on track with most deliverables, but we identified some potential blockers that need attention.',
    reviews: [
      {
        user: { name: 'Maya Patel', avatar: '/avatars/maya.png' },
        comment: 'Good meeting. The blockers we identified are manageable with proper planning.',
        timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: 'act_005',
    type: 'upload',
    icon: 'upload',
    title: 'Processed configuration files',
    description: 'Uploaded and indexed system configuration files for environment setup',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    author: {
      name: 'Jordan Lee',
      avatar: '/avatars/jordan.png'
    },
    details: {
      fileName: 'system-config.json',
      fileSize: '156 KB',
      version: 'v1.2',
      fileType: 'JSON Configuration'
    },
    message: 'Uploaded the latest system configuration files including environment variables and deployment settings. These configs are essential for proper application setup.',
    reviews: [
      {
        user: { name: 'Alex Ray', avatar: '/avatars/alex.png' },
        comment: 'Configuration looks good. All environment variables are properly set.',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: 'act_006',
    type: 'update',
    icon: 'update',
    title: 'Updated project dependencies',
    description: 'Upgraded core libraries to latest stable versions with security patches',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    author: {
      name: 'Security Bot',
      avatar: '/avatars/security-bot.png'
    },
    details: {
      updatedBy: 'Automated Security Scanner',
      packagesUpdated: 8,
      securityPatches: 3,
      breakingChanges: 0,
      changeLog: 'Updated React to 18.3.1, Next.js to 14.2.5, and various security patches'
    },
    message: 'Automated dependency update completed. All core libraries have been upgraded to their latest stable versions with important security patches applied.',
    reviews: [
      {
        user: { name: 'Jordan Lee', avatar: '/avatars/jordan.png' },
        comment: 'Great! No breaking changes detected. All tests are passing.',
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: 'act_007',
    type: 'sync',
    icon: 'sync',
    title: 'Slack workspace connected',
    description: 'Established connection with development team Slack workspace for message sync',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    author: {
      name: 'Integration Bot',
      avatar: '/avatars/integration-bot.png'
    },
    details: {
      workspace: 'synapse-dev-team',
      channels: 12,
      members: 25,
      messagesIndexed: 1247,
      status: 'Active'
    },
    message: 'Successfully established connection with the development team Slack workspace. All relevant channels are now being monitored and messages are being indexed.',
    reviews: []
  },
  {
    id: 'act_008',
    type: 'meeting',
    icon: 'meeting',
    title: 'Client review session',
    description: 'Presented current progress and gathered feedback on user interface improvements',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    author: {
      name: 'Maya Patel',
      avatar: '/avatars/maya.png'
    },
    details: {
      meetingType: 'Client Review',
      attendees: ['Maya Patel', 'Sarah Chen', 'Client Team (4 members)'],
      duration: '1 hour 15 minutes',
      location: 'Client Office / Teams',
      agenda: 'UI/UX review and feedback collection'
    },
    message: 'Comprehensive review session with the client team. Presented the latest UI improvements and gathered valuable feedback for the next iteration.',
    reviews: [
      {
        user: { name: 'Sarah Chen', avatar: '/avatars/sarah.png' },
        comment: 'Client feedback was very positive. They love the new design direction.',
        timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000)
      }
    ]
  }
]

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  
  // Project store
  const { contexts, activeContextId, setActiveContextId } = useProjectStore()

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // Handle activity selection
  const handleActivitySelect = (activityId: string) => {
    setSelectedActivityId(activityId)
  }

  // Get selected activity data
  const selectedActivity = selectedActivityId 
    ? mockActivities.find(activity => activity.id === selectedActivityId)
    : null

  // Filter activities based on activeFilter
  const filteredActivities = mockActivities.filter(activity => {
    if (activeFilter === 'All') return true
    
    // Map filter names to activity types
    const filterMap: { [key: string]: string } = {
      'Uploads': 'upload',
      'Updates': 'update', 
      'Meetings': 'meeting',
      'Syncs': 'sync',
      'Chats': 'chat'
    }
    
    return activity.type === filterMap[activeFilter]
  })

  return (
    <div className="h-screen bg-background text-foreground flex relative overflow-hidden">
      {/* Mobile Header with Hamburger Menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Synapse</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isMobile ? (mobileMenuOpen ? '280px' : '0px') : (sidebarCollapsed ? '80px' : '280px'),
          x: isMobile && !mobileMenuOpen ? '-100%' : '0%'
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
        className={`bg-card border-r border-border flex flex-col relative h-full ${
          isMobile ? 'fixed left-0 top-0 z-40' : ''
        } ${isMobile && !mobileMenuOpen ? 'overflow-hidden' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <AnimatePresence mode="wait">
            {(!sidebarCollapsed || mobileMenuOpen) ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-semibold">Activity Timeline</h2>
                <p className="text-sm text-muted-foreground mb-4">Recent actions</p>
                
                {/* Filter Controls */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filter</p>
                  <Select value={activeFilter} onValueChange={setActiveFilter}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3 w-3" />
                        <SelectValue placeholder="Select filter" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {['All', 'Uploads', 'Updates', 'Meetings', 'Syncs', 'Chats'].map((filter) => (
                        <SelectItem key={filter} value={filter} className="text-xs">
                          {filter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <Clock className="h-6 w-6 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className={`space-y-3 ${
            isMobile && !mobileMenuOpen ? 'hidden' : ''
          }`}>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <TimelineItem
                  key={activity.id}
                  icon={activity.icon}
                  title={activity.title}
                  description={activity.description}
                  timestamp={activity.timestamp}
                  onClick={() => handleActivitySelect(activity.id)}
                  isSelected={selectedActivityId === activity.id}
                  className={sidebarCollapsed && !mobileMenuOpen ? 'justify-center' : ''}
                />
              ))
            ) : (
              (!sidebarCollapsed || mobileMenuOpen) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No activities to show
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {activeFilter === 'All' 
                      ? "Your activity timeline will appear here as you use the application."
                      : `No ${activeFilter.toLowerCase()} activities found. Try selecting a different filter.`
                    }
                  </p>
                </motion.div>
              )
            )}
          </div>
        </div>

        {/* Toggle Button - Hidden on mobile */}
        {!isMobile && (
          <div className="pt-4 border-t flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      <span>Expand</span>
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Collapse</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full ${isMobile ? 'pt-16' : ''}`}>
        {/* Project Selector */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Active Project
              </label>
              <Select value={activeContextId} onValueChange={setActiveContextId}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {contexts.map((context) => (
                    <SelectItem key={context.id} value={context.id}>
                      {context.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4">
          {selectedActivity ? (
            <ActivityDetail activity={selectedActivity} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to Synapse</h3>
                <p className="text-sm text-muted-foreground">
                  Select an activity from the timeline to see its details.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
