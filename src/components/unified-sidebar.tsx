'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatInterface } from './chat-interface'
import { UploadInterface } from './upload-interface'
import { SyncInterface } from './sync-interface'
import { useState, useEffect } from 'react'

interface UnifiedSidebarProps {
  activeView: 'chat' | 'upload' | 'sync' | null
  onClose: () => void
}

export function UnifiedSidebar({ activeView, onClose }: UnifiedSidebarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <AnimatePresence>
      {activeView && (
        <>
          {/* Mobile Overlay */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30"
              onClick={onClose}
            />
          )}

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className={`fixed top-0 h-full bg-background border-l border-border shadow-lg z-40 ${
              isMobile 
                ? 'left-0 right-0 w-full' 
                : 'right-16 w-96'
            }`}
          >
            {/* Close button */}
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content area */}
            <div className="h-full overflow-hidden">
              <AnimatePresence mode="wait">
                {activeView === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ChatInterface />
                  </motion.div>
                )}
                
                {activeView === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <UploadInterface />
                  </motion.div>
                )}
                
                {activeView === 'sync' && (
                  <motion.div
                    key="sync"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <SyncInterface />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}