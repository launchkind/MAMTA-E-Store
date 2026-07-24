import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadToR2, deleteFromR2, type UploadFolder } from "@/lib/r2-upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  folder: UploadFolder;
}

export function ImageUpload({ value, onChange, disabled, folder }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 4000000, // 4MB
    maxFiles: 1,
    disabled: disabled || uploading,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setUploading(true);
      try {
        const url = await uploadToR2(file, folder);
        onChange(url);
        setPreview(url);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Could not upload image",
        });
        setPreview(value || null);
      } finally {
        URL.revokeObjectURL(objectUrl);
        setUploading(false);
      }
    },
  });

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = value;
    onChange("");
    setPreview(null);
    if (current) {
      try {
        await deleteFromR2(current);
      } catch (error) {
        console.warn("Failed to delete image from R2:", current, error);
      }
    }
  };

  return (
    <Card className="border-dashed overflow-hidden">
      <CardContent className="p-0">
        <div
          {...getRootProps({
            className:
              "flex flex-col items-center justify-center p-6 cursor-pointer",
          })}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative w-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-[200px] object-cover rounded-md"
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={disabled || uploading}
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] w-full border border-dashed border-muted-foreground/50 rounded-md">
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1 text-center">
                    Drag &amp; drop or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Image (max 4MB)
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
