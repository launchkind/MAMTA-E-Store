import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "./button";
import { uploadToSupabase, deleteFromSupabase } from "@/lib/storage";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  deferUpload?: boolean;
}

interface UploadingImage {
  index: number;
  preview: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function MultiImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
  deferUpload = false,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState<UploadingImage[]>([]);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    if (deferUpload) {
      try {
        const base64Promises = Array.from(files).map((file) => fileToBase64(file));
        const base64Images = await Promise.all(base64Promises);
        onChange([...base64Images, ...value]);
      } catch (error) {
        console.error("Error converting images to base64:", error);
        alert("Failed to process images");
      }
      return;
    }

    const newUploading: UploadingImage[] = Array.from(files).map((file, index) => ({
      index,
      preview: URL.createObjectURL(file),
    }));
    const shiftedUploading = uploading.map((u) => ({ ...u, index: u.index + files.length }));
    setUploading([...newUploading, ...shiftedUploading]);

    const uploadPromises = Array.from(files).map(async (file, index) => {
      try {
        const url = await uploadToSupabase(file, "products");
        URL.revokeObjectURL(newUploading[index].preview);
        return url;
      } catch (error) {
        console.error("Error uploading image:", error);
        URL.revokeObjectURL(newUploading[index].preview);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter((url): url is string => url !== null);

    if (validUrls.length > 0) {
      onChange([...validUrls, ...value]);
    }
    setUploading([]);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(event.target.files);
    event.target.value = "";
  };

  const handleDropFiles = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled && !isUploading) {
      await processFiles(event.dataTransfer.files);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropReorder = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    handleReorder(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = value[index];

    if (imageUrl.startsWith("data:")) {
      onChange(value.filter((_, i) => i !== index));
      return;
    }

    try {
      setDeletingIndex(index);
      await deleteFromSupabase(imageUrl, "products");
      onChange(value.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from UI even if storage delete fails
      onChange(value.filter((_, i) => i !== index));
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...value];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  const canUploadMore = value.length < maxImages;
  const isUploading = uploading.length > 0;

  return (
    <div
      className="space-y-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {(value.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              draggable={!disabled && !isUploading && deletingIndex !== index}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropReorder(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-square cursor-grab active:cursor-grabbing rounded-lg border-2 overflow-hidden ${
                index === 0 ? "border-blue-500" : "border-green-500"
              } ${deletingIndex === index ? "opacity-50 pointer-events-none" : ""} ${
                draggedIndex === index ? "opacity-50 border-dashed bg-gray-100" : "bg-gray-50"
              }`}
            >
              <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                Uploaded
              </div>
              {deletingIndex === index && (
                <div className="absolute inset-0 bg-white/60 z-20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500 mb-1" />
                  <span className="text-xs font-semibold text-red-600">Deleting...</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled || isUploading || deletingIndex === index}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                {index + 1}
              </div>
            </div>
          ))}

          {uploading.map((uploadingImg) => (
            <div
              key={`loading-${uploadingImg.index}`}
              className="relative aspect-square rounded-lg border-2 border-blue-500 border-dashed bg-gray-50 overflow-hidden animate-pulse"
            >
              <img src={uploadingImg.preview} alt={`Uploading ${uploadingImg.index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-2 bg-white/90 rounded-lg px-4 py-3 shadow-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-xs text-gray-700 font-semibold">Uploading...</span>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                New
              </div>
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {uploadingImg.index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {canUploadMore && (
        <div className="flex flex-col items-center gap-2">
          <label
            htmlFor="multi-image-upload"
            className={`cursor-pointer w-full ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDropFiles}
          >
            <div className={`border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center gap-2 ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
            }`}>
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600 text-center">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">{value.length} of {maxImages} images uploaded</div>
            </div>
            <input id="multi-image-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={disabled || isUploading} className="hidden" />
          </label>
          {value.length > 0 && (
            <p className="text-xs text-gray-500 text-center">The first image will be used as the cover image</p>
          )}
        </div>
      )}

      {!canUploadMore && (
        <div className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          Maximum number of images ({maxImages}) reached
        </div>
      )}
    </div>
  );
}
