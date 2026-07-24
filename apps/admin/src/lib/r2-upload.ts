import { supabase } from "./supabase";

export type UploadFolder =
  | "products"
  | "categories"
  | "banners"
  | "avatars"
  | "icons"
  | "product"
  | "brands"
  | "sellers"
  | "ads_banners"
  | "product_banners"
  | "product_types"
  | "social_media"
  | "website_icons"
  | "product_variants"
  | "users";

const UPLOAD_API_URL = import.meta.env.VITE_UPLOAD_API_URL as string;

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function uploadToR2(file: File, folder: UploadFolder): Promise<string> {
  const auth = await authHeader();
  const presignRes = await fetch(`${UPLOAD_API_URL}/api/r2/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ folder, contentType: file.type }),
  });
  const presignBody = await presignRes.json();
  if (!presignRes.ok || !presignBody.success) {
    throw new Error(presignBody.message || "Failed to get upload URL");
  }

  const { uploadUrl, publicUrl } = presignBody as { uploadUrl: string; publicUrl: string };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error(`Upload to storage failed: ${putRes.status}`);

  return publicUrl;
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = /data:([^;]+);base64/.exec(header)?.[1] || "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

// Forms that defer upload (MultiImageUpload deferUpload / ImageUpload) hold
// pending images as base64 data URIs until submit. Call this right before
// saving to swap any data: URIs for real R2 URLs — anything already a URL
// (unchanged existing image) passes through untouched.
export async function resolveImagesToR2(images: string[], folder: UploadFolder): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (img && img.startsWith("data:")) {
      const file = dataUrlToFile(img, `image-${Date.now()}-${i}`);
      results.push(await uploadToR2(file, folder));
    } else {
      results.push(img);
    }
  }
  return results;
}

export async function resolveImageToR2(image: string, folder: UploadFolder): Promise<string> {
  if (!image || !image.startsWith("data:")) return image;
  return uploadToR2(dataUrlToFile(image, `image-${Date.now()}`), folder);
}

export async function deleteFromR2(url: string): Promise<void> {
  const auth = await authHeader();
  const res = await fetch(`${UPLOAD_API_URL}/api/r2/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Delete failed: ${res.status}`);
  }
}

// Best-effort cleanup for a batch of image URLs (e.g. every image on a row
// being deleted). Skips empty/non-R2 values and never throws — a storage
// cleanup failure should not block the row from being deleted.
export async function deleteManyFromR2(urls: (string | null | undefined)[]): Promise<void> {
  const targets = urls.filter((u): u is string => !!u && !u.startsWith("data:"));
  await Promise.all(
    targets.map((url) => deleteFromR2(url).catch((err) => console.warn("Failed to delete image from R2:", url, err))),
  );
}
