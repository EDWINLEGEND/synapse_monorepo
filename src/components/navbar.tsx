'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

export function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.nav
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-6 right-6 bg-background/90 backdrop-blur-md border border-border rounded-full shadow-lg z-50"
    >
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full w-10 h-10 p-0 hover:bg-muted/50"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.nav>
  )
}