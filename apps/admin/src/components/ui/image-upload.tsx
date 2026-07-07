import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 4000000, // 4MB
    maxFiles: 1,
    disabled,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        try {
          const base64 = await convertToBase64(acceptedFiles[0]);
          onChange(base64);
          setPreview(base64);
        } catch (error) {
          console.error("Error converting file to base64:", error);
        }
      }
    },
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setPreview(null);
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
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] w-full border border-dashed border-muted-foreground/50 rounded-md">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1 text-center">
                Drag &amp; drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground/70">
                Image (max 4MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
