'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, Github, FileText, Loader2, MessageSquare } from 'lucide-react'
import { useUpload, useSync } from '@/hooks'

export default function ControlPanel() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [slackChannels, setSlackChannels] = useState('')
  const [githubOwner, setGithubOwner] = useState('')
  const [githubRepo, setGithubRepo] = useState('')

  const { uploadDocument, uploadMultipleDocuments, isUploading, uploadProgress } = useUpload()
  const { syncSlack, syncGitHub, isSyncing, syncProgress, syncType } = useSync()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setSelectedFiles(fileArray)

    if (fileArray.length === 1) {
      await uploadDocument(fileArray[0])
    } else {
      await uploadMultipleDocuments(fileArray)
    }

    // Reset file input
    event.target.value = ''
    setSelectedFiles([])
  }

  const handleSlackSync = async () => {
    if (!slackChannels.trim()) return

    const channelIds = slackChannels
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0)

    await syncSlack({ channelIds })
    setSlackChannels('')
  }

  const handleGithubSync = async () => {
    if (!githubOwner.trim() || !githubRepo.trim()) return

    await syncGitHub({
      owner: githubOwner.trim(),
      repo: githubRepo.trim(),
      includePRs: true,
      includeIssues: true
    })

    setGithubOwner('')
    setGithubRepo('')
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Control Panel</h1>
            <p className="text-muted-foreground text-lg">
              Manage your data sources and sync content to the knowledge engine
            </p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Document Upload</TabsTrigger>
              <TabsTrigger value="slack">Slack Sync</TabsTrigger>
              <TabsTrigger value="github">GitHub Sync</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>
                    Upload .txt or .md files to add them to your knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Select .txt or .md files to upload
                      </p>
                      <Input
                        type="file"
                        accept=".txt,.md"
                        multiple
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected files:</p>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{file.name}</span>
                            <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading documents...
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="slack" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Slack Sync
                  </CardTitle>
                  <CardDescription>
                    Sync messages from Slack channels to your knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slack-channels">
                      Channel IDs (comma-separated)
                    </Label>
                    <Input
                      id="slack-channels"
                      placeholder="C1234567890, C0987654321"
                      value={slackChannels}
                      onChange={(e) => setSlackChannels(e.target.value)}
                      disabled={isSyncing && syncType === 'slack'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter Slack channel IDs separated by commas
                    </p>
                  </div>
                  
                  {isSyncing && syncType === 'slack' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Syncing Slack channels...
                      </div>
                      <Progress value={syncProgress} className="w-full" />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSlackSync}
                    disabled={isSyncing || !slackChannels.trim()}
                    className="w-full"
                  >
                    {isSyncing && syncType === 'slack' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Sync Slack Channels
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Sync
                  </CardTitle>
                  <CardDescription>
                    Sync code and documentation from GitHub repositories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="github-owner">
                        Repository Owner
                      </Label>
                      <Input
                        id="github-owner"
                        placeholder="username or organization"
                        value={githubOwner}
                        onChange={(e) => setGithubOwner(e.target.value)}
                        disabled={isSyncing && syncType === 'github'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="github-repo">
                        Repository Name
                      </Label>
                      <Input
                        id="github-repo"
                        placeholder="repository-name"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        disabled={isSyncing && syncType === 'github'}
                      />
                    </div>
                  </div>
                  
                  {isSyncing && syncType === 'github' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Syncing GitHub repository...
                      </div>
                      <Progress value={syncProgress} className="w-full" />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleGithubSync}
                    disabled={isSyncing || !githubOwner.trim() || !githubRepo.trim()}
                    className="w-full"
                  >
                    {isSyncing && syncType === 'github' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Github className="h-4 w-4 mr-2" />
                        Sync GitHub Repository
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}