import { useState } from 'react'
import { toast } from 'sonner'

interface UploadResponse {
  success: boolean
  message: string
  fileId?: string
}

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadDocument = async (file: File): Promise<UploadResponse> => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      setUploadProgress(100)
      toast.success(`Successfully uploaded ${file.name}`)
      
      return {
        success: true,
        message: data.message || 'File uploaded successfully',
        fileId: data.fileId
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage)
      
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const uploadMultipleDocuments = async (files: File[]): Promise<UploadResponse[]> => {
    const results: UploadResponse[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress((i / files.length) * 100)
      
      const result = await uploadDocument(file)
      results.push(result)
      
      // Small delay between uploads to prevent overwhelming the server
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return results
  }

  return {
    uploadDocument,
    uploadMultipleDocuments,
    isUploading,
    uploadProgress
  }
}