'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Upload, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { UnifiedSidebar } from './unified-sidebar'

type ActiveView = 'chat' | 'upload' | 'sync' | null

export function FloatingNavbar() {
  const [activeView, setActiveView] = useState<ActiveView>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleViewToggle = (view: ActiveView) => {
    setActiveView(activeView === view ? null : view)
  }

  const navItems = [
    {
      id: 'chat' as const,
      icon: MessageSquare,
      label: 'Chat',
      description: 'Ask questions about your documents'
    },
    {
      id: 'upload' as const,
      icon: Upload,
      label: 'Upload',
      description: 'Add documents to your knowledge base'
    },
    {
      id: 'sync' as const,
      icon: RefreshCw,
      label: 'Sync',
      description: 'Connect Slack and GitHub'
    }
  ]

  return (
    <>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`fixed z-50 ${
          isMobile 
            ? 'bottom-4 right-4 left-4' 
            : 'right-4 top-1/2 -translate-y-1/2'
        }`}
      >
        <div className={`bg-background/80 backdrop-blur-md border border-border shadow-lg ${
          isMobile 
            ? 'rounded-2xl p-3' 
            : 'rounded-full p-2'
        }`}>
          <div className={`flex gap-2 ${
            isMobile ? 'justify-center' : 'flex-col'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        size={isMobile ? 'default' : 'sm'}
                        onClick={() => handleViewToggle(item.id)}
                        className={`transition-all duration-200 ${
                          isMobile 
                            ? 'h-12 w-12 p-0 rounded-xl' 
                            : 'h-10 w-10 p-0 rounded-full'
                        }`}
                        aria-label={item.description}
                      >
                        <Icon className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={isMobile ? 'top' : 'left'}>
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      <UnifiedSidebar 
        activeView={activeView} 
        onClose={() => setActiveView(null)} 
      />
    </>
  )
}