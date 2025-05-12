"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadFormProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const ALLOWED_FILE_TYPES = [".blend"];
const MAX_FILE_SIZE_MB = 100; // Example limit: 100MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function FileUploadForm({ onFileUpload, isUploading }: FileUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
        setFileError(`Invalid file type. Please upload a ${ALLOWED_FILE_TYPES.join(", ")} file.`);
        setSelectedFile(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setFileError(null);
    } else {
      setSelectedFile(null);
      setFileError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFile && !fileError) {
      onFileUpload(selectedFile);
      setSelectedFile(null); 
      // Reset file input visually if needed, by controlling its value or re-rendering the form key
      const fileInput = event.currentTarget.elements.namedItem("fileInput") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } else if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
    } else if (fileError) {
       toast({
        title: "File Error",
        description: fileError,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-lg shadow-md">
      <div>
        <Label htmlFor="fileInput" className="text-lg font-medium">Upload Render File</Label>
        <div className="mt-2 flex items-center justify-center w-full">
            <label
                htmlFor="fileInput"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent/50 border-primary/50 hover:border-primary transition-colors"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ALLOWED_FILE_TYPES.join(", ")} files up to {MAX_FILE_SIZE_MB}MB
                    </p>
                    {selectedFile && <p className="text-xs text-primary mt-2">{selectedFile.name}</p>}
                </div>
                <Input 
                  id="fileInput" 
                  name="fileInput"
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept={ALLOWED_FILE_TYPES.join(",")} 
                />
            </label>
        </div>
        {fileError && <p className="mt-2 text-sm text-destructive">{fileError}</p>}
      </div>
      <Button type="submit" disabled={isUploading || !selectedFile || !!fileError} className="w-full">
        {isUploading ? "Processing..." : "Upload and Check"}
      </Button>
    </form>
  );
}
