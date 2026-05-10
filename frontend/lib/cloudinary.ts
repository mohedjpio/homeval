const CLOUD  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', PRESET)
  form.append('folder', 'avatars')
  form.append('public_id', userId)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || 'Upload failed')
  }

  const data = await res.json()
  // Append timestamp so the URL is always unique — forces browser to re-fetch
  return `${data.secure_url}?cb=${Date.now()}`
}

export const avatarUrl = (userId: string, size = 128) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/w_${size},h_${size},c_fill,g_face,r_max/avatars/${userId}`
