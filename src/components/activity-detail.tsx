'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  MessageCircle, 
  GitBranch, 
  Users, 
  RefreshCw,
  Clock,
  User,
  FileText
} from 'lucide-react'

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
  description: string
  timestamp: Date
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

interface ActivityDetailProps {
  activity: Activity
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'upload': return Upload
    case 'chat': return MessageCircle
    case 'sync': return GitBranch
    case 'meeting': return Users
    case 'update': return RefreshCw
    default: return FileText
  }
}

const formatTimestamp = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export const ActivityDetail: React.FC<ActivityDetailProps> = ({ activity }) => {
  const IconComponent = getActivityIcon(activity.type)

  const renderTypeSpecificDetails = () => {
    switch (activity.type) {
      case 'upload':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">File:</span>
              <p className="font-medium">{activity.details.fileName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <p className="font-medium">{activity.details.fileSize}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Version:</span>
              <p className="font-medium">{activity.details.version}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium">{activity.details.fileType}</p>
            </div>
          </div>
        )

      case 'chat':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Topic:</span>
              <p className="font-medium">{activity.details.topic}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Participants:</span>
              <p className="font-medium">{activity.details.participants}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <p className="font-medium">{activity.details.duration}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Channel:</span>
              <p className="font-medium">{activity.details.channel}</p>
            </div>
          </div>
        )

      case 'sync':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Repository:</span>
              <p className="font-medium">{activity.details.repository}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Branch:</span>
              <p className="font-medium">{activity.details.branch}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Commits:</span>
              <p className="font-medium">{activity.details.commits}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pull Requests:</span>
              <p className="font-medium">{activity.details.pullRequests}</p>
            </div>
          </div>
        )

      case 'meeting':
        return (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">{activity.details.meetingType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-medium">{activity.details.duration}</p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Location:</span>
              <p className="font-medium">{activity.details.location}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Attendees:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activity.details.attendees?.map((attendee: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {attendee}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 'update':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Updated by:</span>
              <p className="font-medium">{String(activity.details.updatedBy)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Packages:</span>
              <p className="font-medium">{String(activity.details.packagesUpdated)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Security Patches:</span>
              <p className="font-medium">{String(activity.details.securityPatches)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Breaking Changes:</span>
              <p className="font-medium">{String(activity.details.breakingChanges)}</p>
            </div>
          </div>
        )

      default:
        return <p className="text-sm text-muted-foreground">No additional details available.</p>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 max-w-4xl overflow-y-auto max-h-full"
    >
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-lg font-semibold truncate">{activity.title}</h1>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {activity.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Details Box */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Quick Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="text-sm space-y-2">
              {renderTypeSpecificDetails()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message/Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {activity.message && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="h-4 w-4" />
                Message
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-sm leading-relaxed">{activity.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Reviews/Comments Section */}
        {activity.reviews && activity.reviews.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Comments ({activity.reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                {activity.reviews.map((review, index) => (
                  <div key={index} className="flex gap-3">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarImage src={review.user.avatar} alt={review.user.name} />
                      <AvatarFallback className="text-xs">
                        {review.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{review.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(review.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  )
}