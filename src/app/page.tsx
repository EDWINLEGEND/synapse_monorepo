'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageCircle, LayoutDashboard, Zap } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8 max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center mb-8"
          >
            <Zap className="h-16 w-16 text-primary" />
          </motion.div>
          
          <h1 className="text-6xl font-bold tracking-tight">
            Synapse
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            A minimal, powerful knowledge engine that connects your documents, 
            conversations, and code in one intelligent interface.
          </p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <Button
              size="lg"
              onClick={() => router.push('/chat')}
              className="flex items-center gap-2 px-8 py-6 text-lg"
            >
              <MessageCircle className="h-5 w-5" />
              Start Chatting
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/control-panel')}
              className="flex items-center gap-2 px-8 py-6 text-lg"
            >
              <LayoutDashboard className="h-5 w-5" />
              Control Panel
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
