export interface RenderJob {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUri?: string; // Temporary storage for AI processing
  status: 'Uploaded' | 'DetectingErrors' | 'PendingConfirmation' | 'Queued' | 'Rendering' | 'Completed' | 'Error' | 'Cancelled';
  progress: number; // 0-100
  detectedErrors: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
  errorDetails?: string; // For render pipeline errors or general errors
}
