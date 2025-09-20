'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Send, 
  User, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  FileText, 
  MessageSquare, 
  Code,
  Upload,
  Github,
  Slack
} from 'lucide-react'
import { useQuery, useUpload, useSync } from '@/hooks'

// Types from existing components
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
  isError?: boolean
}

function Dashboard() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Sync state
  const [slackChannels, setSlackChannels] = useState('')
  const [githubOwner, setGithubOwner] = useState('')
  const [githubRepo, setGithubRepo] = useState('')

  // Hooks
  const { query, isQuerying, error } = useQuery()
  const { uploadDocument, uploadMultipleDocuments, isUploading, uploadProgress } = useUpload()
  const { syncSlack, syncGitHub, isSyncing, syncProgress, syncType } = useSync()

  // Chat functionality
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isQuerying) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await query(input)
      
      if (response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.answer,
          sources: response.sources,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Handle case where query returns null
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `❌ **Query Error**: ${error?.message || 'Unknown error occurred'}\n\nPlease try again or check your connection.`,
          sources: [],
          timestamp: new Date(),
          isError: true
        }

        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Query failed:', error)
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ **Network Error**: ${error instanceof Error ? error.message : 'Failed to connect to server'}\n\nPlease check your connection and try again.`,
        sources: [],
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Upload functionality
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      if (selectedFiles.length === 1) {
        await uploadDocument(selectedFiles[0])
      } else {
        await uploadMultipleDocuments(selectedFiles)
      }
      setSelectedFiles([])
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  // Sync functionality
  const handleSlackSync = async () => {
    if (!slackChannels.trim()) return

    try {
      const channelIds = slackChannels.split(',').map(id => id.trim())
      await syncSlack({ channelIds })
      setSlackChannels('')
    } catch (error) {
      console.error('Slack sync failed:', error)
    }
  }

  const handleGithubSync = async () => {
    if (!githubOwner.trim() || !githubRepo.trim()) return

    try {
      await syncGitHub({ 
        owner: githubOwner, 
        repo: githubRepo, 
        includePRs: true, 
        includeIssues: true 
      })
      setGithubOwner('')
      setGithubRepo('')
    } catch (error) {
      console.error('GitHub sync failed:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content Area - Left Column */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl lg:text-4xl font-bold text-muted-foreground">
              Synapse Dashboard
            </h1>
            <p className="text-sm lg:text-lg text-muted-foreground">
              Use the sidebar to interact with your knowledge base
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sidebar - Right Column */}
      <div className="w-full lg:w-96 border-l bg-card/50 flex flex-col">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-2">
            <TabsTrigger value="chat" className="text-xs lg:text-sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs lg:text-sm">
              <Upload className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="slack" className="text-xs lg:text-sm">
              <Slack className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Slack</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="text-xs lg:text-sm">
              <Github className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col p-2 lg:p-4 space-y-4">
            {/* Messages Area */}
            <div className="flex-1 space-y-3 min-h-[200px] lg:min-h-[300px] max-h-[300px] lg:max-h-[500px] overflow-y-auto bg-background rounded-lg p-3 border">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">Start a conversation...</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-2"
                    >
                      <div className={`flex items-start space-x-2 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {message.type === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <Card className={`max-w-[80%] ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : message.isError 
                              ? 'bg-destructive/10 border-destructive/20' 
                              : 'bg-muted'
                        }`}>
                          <CardContent className="p-3">
                            <p className={`text-sm whitespace-pre-wrap ${
                              message.isError ? 'text-destructive' : ''
                            }`}>{message.content}</p>
                          </CardContent>
                        </Card>
                        {message.type === 'user' && (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="ml-8 space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSourceExpansion(message.id)}
                            className="h-auto p-1 text-xs"
                          >
                            {expandedSources.has(message.id) ? (
                              <ChevronUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 mr-1" />
                            )}
                            {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                          </Button>
                          
                          <AnimatePresence>
                            {expandedSources.has(message.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                {message.sources.map((source) => (
                                  <Card key={source.id} className="bg-background/50">
                                    <CardContent className="p-2">
                                      <div className="flex items-center space-x-2 mb-1">
                                        {getSourceIcon(source.metadata.type)}
                                        <span className="text-xs font-medium">
                                          {source.metadata.filename || 
                                           source.metadata.channel || 
                                           source.metadata.pr || 
                                           'Unknown'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-3">
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isQuerying}
                className="flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleChatSubmit(e)
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={isQuerying || !input.trim()}
                size="sm"
              >
                {isQuerying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="flex-1 space-y-4 p-2 lg:p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Documents</CardTitle>
                <CardDescription className="text-sm">
                  Upload .txt and .md files to your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm">Select Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".txt,.md"
                    onChange={handleFileSelect}
                    className="text-sm"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Selected Files:</Label>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="w-full"
                  size="sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>

                {isUploading && (
                  <div className="space-y-2">
                    <Label className="text-sm">Upload Progress</Label>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slack Sync Tab */}
          <TabsContent value="slack" className="flex-1 space-y-4 p-2 lg:p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Slack Sync</CardTitle>
                <CardDescription className="text-sm">
                  Sync messages from Slack channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-channels" className="text-sm">Channel IDs</Label>
                  <Input
                    id="slack-channels"
                    value={slackChannels}
                    onChange={(e) => setSlackChannels(e.target.value)}
                    placeholder="C1234567890, C0987654321"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter comma-separated channel IDs
                  </p>
                </div>

                <Button 
                  onClick={handleSlackSync}
                  disabled={!slackChannels.trim() || (isSyncing && syncType === 'slack')}
                  className="w-full"
                  size="sm"
                >
                  {isSyncing && syncType === 'slack' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Slack className="h-4 w-4 mr-2" />
                      Sync Channels
                    </>
                  )}
                </Button>

                {isSyncing && syncType === 'slack' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Sync Progress</Label>
                    <Progress value={syncProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{syncProgress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GitHub Sync Tab */}
          <TabsContent value="github" className="flex-1 space-y-4 p-2 lg:p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GitHub Sync</CardTitle>
                <CardDescription className="text-sm">
                  Sync issues and PRs from GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="github-owner" className="text-sm">Repository Owner</Label>
                  <Input
                    id="github-owner"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                    placeholder="octocat"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github-repo" className="text-sm">Repository Name</Label>
                  <Input
                    id="github-repo"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="Hello-World"
                    className="text-sm"
                  />
                </div>

                <Button 
                  onClick={handleGithubSync}
                  disabled={!githubOwner.trim() || !githubRepo.trim() || (isSyncing && syncType === 'github')}
                  className="w-full"
                  size="sm"
                >
                  {isSyncing && syncType === 'github' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Github className="h-4 w-4 mr-2" />
                      Sync Repository
                    </>
                  )}
                </Button>

                {isSyncing && syncType === 'github' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Sync Progress</Label>
                    <Progress value={syncProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{syncProgress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard