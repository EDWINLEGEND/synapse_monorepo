'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, User, Bot, ChevronDown, ChevronUp, Loader2, FileText, MessageSquare, Code } from 'lucide-react'
import { useQuery } from '@/hooks'

interface Source {
  id: string
  content: string
  metadata: {
    filename?: string
    channel?: string
    pr?: string
    type: 'document' | 'slack' | 'github'
  }
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: Date
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { query, isQuerying, error } = useQuery()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleSourceExpansion = (messageId: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'slack':
        return <MessageSquare className="h-4 w-4" />
      case 'github':
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isQuerying) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input.trim()
    setInput('')

    const response = await query(currentInput)
    
    if (response) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } else if (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-24">
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Chat Interface</h1>
          <p className="text-muted-foreground text-lg">
            Ask questions about your documents, Slack conversations, and code
          </p>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 space-y-4 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation by asking a question!</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Card className={message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                        <CardContent className="p-4">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </CardContent>
                      </Card>
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSourceExpansion(message.id)}
                            className="flex items-center gap-2 text-xs"
                          >
                            {expandedSources.has(message.id) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
                          </Button>
                          
                          <AnimatePresence>
                            {expandedSources.has(message.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2"
                              >
                                {message.sources.map((source, index) => (
                                  <Card key={source.id} className="bg-muted/50">
                                    <CardContent className="p-3">
                                      <div className="flex items-start gap-2 mb-2">
                                        {getSourceIcon(source.metadata.type)}
                                        <div className="text-xs text-muted-foreground">
                                          {source.metadata.filename && (
                                            <span>File: {source.metadata.filename}</span>
                                          )}
                                          {source.metadata.channel && (
                                            <span>Channel: {source.metadata.channel}</span>
                                          )}
                                          {source.metadata.pr && (
                                            <span>PR: {source.metadata.pr}</span>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground line-clamp-3">
                                        {source.content}
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {/* Loading indicator */}
          {isQuerying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your knowledge base..."
            disabled={isQuerying}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={isQuerying || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </main>
    </div>
  )
}