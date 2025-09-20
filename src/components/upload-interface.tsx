'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { useUpload } from '@/hooks'

export function UploadInterface() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { uploadDocument, uploadMultipleDocuments, isUploading, uploadProgress } = useUpload()

  const validateFiles = (files: FileList | File[]): File[] => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop()
      return extension === 'txt' || extension === 'md'
    })
    
    if (validFiles.length !== fileArray.length) {
      // Show error for invalid files
      const invalidCount = fileArray.length - validFiles.length
      console.warn(`${invalidCount} file(s) were skipped. Only .txt and .md files are supported.`)
    }
    
    return validFiles
  }

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return

    setSelectedFiles(files)

    if (files.length === 1) {
      await uploadDocument(files[0])
    } else {
      await uploadMultipleDocuments(files)
    }

    setSelectedFiles([])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const validFiles = validateFiles(files)
    await processFiles(validFiles)

    // Reset file input
    event.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const validFiles = validateFiles(files)
    await processFiles(validFiles)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Document Upload</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload .txt or .md files to add them to your knowledge base
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isDragOver 
                    ? 'Drop your .txt or .md files here' 
                    : 'Drag and drop files here, or click to select'
                  }
                </p>
                <Input
                  type="file"
                  accept=".txt,.md"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="max-w-xs mx-auto cursor-pointer"
                />
              </div>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-6">
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
              <div className="space-y-2 mt-6">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading documents...
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}