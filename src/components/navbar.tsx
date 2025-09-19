'use client'

import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Settings, MessageCircle, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      label: 'Control Panel',
      path: '/control-panel',
      icon: LayoutDashboard,
    },
    {
      label: 'Chat',
      path: '/chat',
      icon: MessageCircle,
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background/80 backdrop-blur-md border border-border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            
            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </motion.div>
            )
          })}
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </nav>
  )
}