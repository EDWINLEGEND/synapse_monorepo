'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Github, Loader2, MessageSquare } from 'lucide-react'
import { useSync } from '@/hooks'

export function SyncInterface() {
  const [slackChannels, setSlackChannels] = useState('')
  const [githubOwner, setGithubOwner] = useState('')
  const [githubRepo, setGithubRepo] = useState('')

  const { syncSlack, syncGitHub, isSyncing, syncProgress, syncType } = useSync()

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Sync Data</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect and sync data from Slack and GitHub
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="slack" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="slack">Slack</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
          </TabsList>

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
                <div className="grid grid-cols-1 gap-4">
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
      </div>
    </div>
  )
}