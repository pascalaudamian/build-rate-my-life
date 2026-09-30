import { put } from '@vercel/blob'
import { datasets } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { requireUser, jsonError, requestId } from '@/lib/api-auth'

const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'text/calendar', 'text/csv', 'application/json', 'application/zip', 'application/octet-stream'])
const maxBytes = 8 * 1024 * 1024

export async function POST(request: Request) {
  const user = await requireUser()
  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return jsonError('Choose an image to upload.')
  if (!allowedTypes.has(file.type)) return jsonError('Upload a supported PNG, JPG, WebP, ICS, CSV, or JSON export.')
  if (file.size > maxBytes) return jsonError('Screenshots must be smaller than 8 MB.')
  const pathname = `users/${user.id}/uploads/${requestId()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)}`
  const blob = await put(pathname, file, { access: 'private', addRandomSuffix: false, contentType: file.type })
  const [dataset] = await db.insert(datasets).values({ id: requestId(), userId: user.id, name: file.name.slice(0, 120), kind: file.type.startsWith('image/') ? 'screenshot' : file.type === 'text/calendar' ? 'calendar_export' : 'data_export', metadata: { pathname: blob.pathname, mimeType: file.type, bytes: file.size, status: 'uploaded' } }).returning()
  return Response.json({ dataset, message: 'Screenshot uploaded securely and queued for processing.' }, { status: 201 })
}
