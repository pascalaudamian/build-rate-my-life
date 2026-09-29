import { requireUser } from '@/lib/api-auth'

export async function GET() {
  const user = await requireUser()
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, image: user.image } })
}
