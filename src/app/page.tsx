"use client";

import { useState, useEffect, useCallback } from "react";
import type { RenderJob } from "@/types";
import { FileUploadForm } from "@/components/FileUploadForm";
import { RenderJobCard } from "@/components/RenderJobCard";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { detectRenderErrors } from "@/ai/flows/detect-render-errors";
import { BarChartBig, FileCog, Server } from "lucide-react"; // Film icon instead of Asteroid

// Helper to read file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function HomePage() {
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newJob: RenderJob = {
      id: jobId,
      fileName: file.name,
      fileType: file.name.substring(file.name.lastIndexOf('.')),
      fileSize: file.size,
      status: "Uploaded",
      progress: 0,
      detectedErrors: [],
    };
    setRenderJobs(prevJobs => [newJob, ...prevJobs]);

    try {
      const dataUri = await readFileAsDataURL(file);
      setRenderJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, dataUri, status: "DetectingErrors", progress: 10 } : j));
      
      // AI Error Detection
      const aiResult = await detectRenderErrors({
        fileDataUri: dataUri,
        fileName: file.name,
        fileType: newJob.fileType,
      });

      setRenderJobs(prevJobs => prevJobs.map(j => {
        if (j.id === jobId) {
          const updatedJob = { ...j, detectedErrors: aiResult.errors, progress: 100 };
          delete updatedJob.dataUri; // Remove dataUri after use

          if (aiResult.errors.length > 0) {
            updatedJob.status = "PendingConfirmation";
            toast({ title: "Potential Errors Detected", description: `Check ${file.name} for details.`, variant: "default" });
          } else {
            updatedJob.status = "Queued";
            // Automatically proceed if no errors
            simulateRendering(jobId, true); 
          }
          return updatedJob;
        }
        return j;
      }));

    } catch (error) {
      console.error("Error processing file:", error);
      setRenderJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: "Error", errorDetails: "Failed to process file for AI check.", progress: 0 } : j));
      toast({ title: "Upload Error", description: `Could not process ${file.name}.`, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const simulateRendering = useCallback((jobId: string, isAutoProceed: boolean = false) => {
    setRenderJobs(prevJobs => prevJobs.map(j => {
      if (j.id === jobId) {
        if (!isAutoProceed) { // if manually proceeded, show toast
          toast({ title: "Render Started", description: `Rendering ${j.fileName}...` });
        }
        return { ...j, status: "Rendering", progress: 0 };
      }
      return j;
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5; // Simulate variable progress
      if (progress >= 100) {
        clearInterval(interval);
        setRenderJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { 
          ...j, 
          status: "Completed", 
          progress: 100,
          thumbnailUrl: `https://picsum.photos/seed/${jobId}/400/300`, // Unique placeholder per job
          downloadUrl: "#" // Dummy download link
        } : j));
        toast({ title: "Render Complete!", description: `${renderJobs.find(j=>j.id===jobId)?.fileName} has finished rendering.`, className: "bg-green-600 text-white" });

      } else {
        // Simulate a chance of error during rendering
        if (Math.random() < 0.05 && progress > 30 && progress < 80) { // Small chance of error mid-render
            clearInterval(interval);
            setRenderJobs(prevJobs => prevJobs.map(j => j.id === jobId ? {
                ...j,
                status: "Error",
                progress, // Keep current progress on error
                errorDetails: "A simulated an_error_occurred_during_render. Please check logs (not implemented)."
            } : j));
            toast({ title: "Render Failed", description: `An error occurred while rendering ${renderJobs.find(j=>j.id===jobId)?.fileName}.`, variant: "destructive" });
            return;
        }
        setRenderJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, progress } : j));
      }
    }, 500); // Update progress every 0.5 seconds
  }, [toast, renderJobs]); // Added renderJobs to dependency array for toast message

  const handleProceedWithRender = (jobId: string) => {
    simulateRendering(jobId);
  };

  const handleCancelJob = (jobId: string) => {
    setRenderJobs(prevJobs => prevJobs.map(j => j.id === jobId ? {...j, status: "Cancelled", progress: 0} : j));
    toast({ title: "Job Cancelled", description: `Job ${renderJobs.find(j=>j.id===jobId)?.fileName} has been cancelled.` });
  };
  
  const handleDeleteJob = (jobId: string) => {
    setRenderJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));
    toast({ title: "Job Deleted", description: `Job has been removed from the list.` });
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r" collapsible="icon">
          <SidebarHeader className="p-4 border-b">
             <div className="flex items-center gap-2">
                <FileCog className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-semibold text-primary whitespace-nowrap group-data-[collapsible=icon]:hidden">
                  Remote Render
                </h1>
              </div>
          </SidebarHeader>
          {/* Future navigation can go here using SidebarMenu */}
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 gap-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-xl font-semibold">Dashboard</h2>
            </div>
            {/* Add UserProfile dropdown or other header items here if needed */}
          </header>

          <ScrollArea className="h-[calc(100vh-4rem)]"> {/* Adjust height based on header */}
            <main className="flex-1 p-4 md:p-8 space-y-8">
              <section aria-labelledby="file-upload-section">
                <h2 id="file-upload-section" className="text-2xl font-semibold mb-4 text-primary flex items-center">
                  <Server className="mr-2 h-6 w-6"/>
                  Upload to Farm
                </h2>
                <FileUploadForm onFileUpload={handleFileUpload} isUploading={isUploading} />
              </section>

              <section aria-labelledby="render-jobs-section">
                <h2 id="render-jobs-section" className="text-2xl font-semibold mb-6 text-primary flex items-center">
                  <BarChartBig className="mr-2 h-6 w-6"/>
                  Render Queue & Results
                </h2>
                {renderJobs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-border rounded-lg">
                    <p className="text-lg">No render jobs yet.</p>
                    <p>Upload a file to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {renderJobs.map(job => (
                      <RenderJobCard 
                        key={job.id} 
                        job={job} 
                        onProceed={handleProceedWithRender}
                        onCancel={handleCancelJob}
                        onDelete={handleDeleteJob}
                      />
                    ))}
                  </div>
                )}
              </section>
            </main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
