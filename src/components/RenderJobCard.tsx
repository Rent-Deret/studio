"use client";

import Image from "next/image";
import type { RenderJob } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Download, FileText, Loader2, Play, Trash2, XCircle } from "lucide-react";

interface RenderJobCardProps {
  job: RenderJob;
  onProceed: (jobId: string) => void;
  onCancel: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

export function RenderJobCard({ job, onProceed, onCancel, onDelete }: RenderJobCardProps) {
  const getStatusColor = (status: RenderJob["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-500 hover:bg-green-600";
      case "Error":
      case "Cancelled":
        return "bg-red-500 hover:bg-red-600";
      case "Rendering":
      case "DetectingErrors":
        return "bg-blue-500 hover:bg-blue-600";
      case "PendingConfirmation":
        return "bg-yellow-500 text-yellow-900 hover:bg-yellow-600";
      case "Queued":
      case "Uploaded":
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusIcon = (status: RenderJob["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "Error":
      case "Cancelled":
        return <XCircle className="w-4 h-4 mr-1" />;
      case "Rendering":
      case "DetectingErrors":
        return <Loader2 className="w-4 h-4 mr-1 animate-spin" />;
      case "PendingConfirmation":
        return <AlertTriangle className="w-4 h-4 mr-1" />;
      default:
        return <FileText className="w-4 h-4 mr-1" />;
    }
  }

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 truncate" title={job.fileName}>{job.fileName}</CardTitle>
            <CardDescription className="text-xs">
              {(job.fileSize / (1024 * 1024)).toFixed(2)} MB - {job.fileType}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`text-xs flex items-center ${getStatusColor(job.status)} text-white border-0`}>
            {getStatusIcon(job.status)} {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(job.status === "Rendering" || job.status === "Completed" || job.status === "DetectingErrors") && job.progress > 0 && (
          <div>
            <Progress value={job.progress} className="w-full h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">{job.progress}% complete</p>
          </div>
        )}

        {job.status === "PendingConfirmation" && job.detectedErrors.length > 0 && (
          <Alert variant="destructive" className="bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle>Potential Render Errors Detected!</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside text-xs mt-1">
                {job.detectedErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
              <p className="text-xs mt-2">You can still proceed, but rendering might fail or produce unexpected results.</p>
            </AlertDescription>
          </Alert>
        )}

        {job.status === "Error" && job.errorDetails && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Render Failed</AlertTitle>
            <AlertDescription className="text-xs">{job.errorDetails}</AlertDescription>
          </Alert>
        )}

        {job.status === "Completed" && job.thumbnailUrl && (
          <div className="mt-2 rounded-md overflow-hidden border border-border aspect-video relative">
            <Image 
              src={job.thumbnailUrl} 
              alt={`Rendered thumbnail for ${job.fileName}`} 
              layout="fill"
              objectFit="cover"
              data-ai-hint="render output"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-border/50">
        {job.status === "PendingConfirmation" && (
          <>
            <Button variant="outline" size="sm" onClick={() => onCancel(job.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Cancel Job
            </Button>
            <Button size="sm" onClick={() => onProceed(job.id)} className="bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-4 w-4" /> Proceed Anyway
            </Button>
          </>
        )}
        {job.status === "Completed" && job.downloadUrl && (
          <Button asChild size="sm" variant="default" className="bg-primary hover:bg-primary/90">
            <a href={job.downloadUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> Download Result
            </a>
          </Button>
        )}
        {(job.status === "Error" || job.status === "Completed" || job.status === "Cancelled") && (
           <Button variant="ghost" size="sm" onClick={() => onDelete(job.id)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
        {(job.status === "Queued" || job.status === "Rendering" || job.status === "Uploaded" || job.status === "DetectingErrors") && (
           <Button variant="outline" size="sm" onClick={() => onCancel(job.id)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
