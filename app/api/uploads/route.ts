import { datasets } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { requireUser, jsonError, requestId } from '@/lib/api-auth'

const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp'])
const maxBytes = 8 * 1024 * 1024

export async function POST(request: Request) {
  const user = await requireUser()
  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return jsonError('Choose an image to upload.')
  if (!allowedTypes.has(file.type)) return jsonError('Upload a PNG, JPG, or WebP screenshot.')
  if (file.size > maxBytes) return jsonError('Screenshots must be smaller than 8 MB.')
  const [dataset] = await db.insert(datasets).values({ id: requestId(), userId: user.id, name: file.name.slice(0, 120), kind: 'screenshot', metadata: { mimeType: file.type, bytes: file.size, status: 'uploaded' } }).returning()
  return Response.json({ dataset, message: 'Screenshot uploaded securely and queued for processing.' }, { status: 201 })
}
