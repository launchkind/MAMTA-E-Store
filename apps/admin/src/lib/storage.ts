import { supabase } from './supabase'

export type StorageBucket = 'products' | 'categories' | 'banners' | 'avatars' | 'icons'

export async function uploadToSupabase(file: File, bucket: StorageBucket): Promise<string> {
  const ext = file.name.split('.').pop()
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(safeName, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

export async function deleteFromSupabase(url: string, bucket: StorageBucket): Promise<void> {
  const marker = `/storage/v1/object/public/${bucket}/`
  const path = url.split(marker)[1]
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}
