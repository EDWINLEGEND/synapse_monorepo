'use client'

import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Users, 
  RefreshCw, 
  MessageSquare, 
  GitBranch,
  Calendar,
  Settings,
  Database,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Icon mapping utility
const getActivityIcon = (type: string) => {
  const iconMap = {
    upload: Upload,
    update: FileText,
    meeting: Users,
    sync: RefreshCw,
    chat: MessageSquare,
    commit: GitBranch,
    event: Calendar,
    config: Settings,
    database: Database,
    default: Clock
  }
  
  return iconMap[type as keyof typeof iconMap] || iconMap.default
}

// Time formatting utility
const formatTimestamp = (timestamp: string | Date) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

interface TimelineItemProps {
  icon: string
  title: string
  description: string
  timestamp: string | Date
  className?: string
  onClick?: () => void
  isSelected?: boolean
}

export function TimelineItem({ 
  icon, 
  title, 
  description, 
  timestamp, 
  className,
  onClick,
  isSelected = false
}: TimelineItemProps) {
  const IconComponent = getActivityIcon(icon)
  const formattedTime = formatTimestamp(timestamp)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group cursor-pointer",
        isSelected && "bg-primary/10 border border-primary/20 hover:bg-primary/15",
        className
      )}
    >
      {/* Icon */}
      <motion.div 
        className="flex-shrink-0 mt-0.5"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200 group-hover:shadow-md">
          <IconComponent className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110" />
        </div>
      </motion.div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <motion.h4 
            className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h4>
          <motion.span 
            className="text-xs text-muted-foreground whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {formattedTime}
          </motion.span>
        </div>
        
        <motion.p 
          className="text-xs text-muted-foreground leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  )
}