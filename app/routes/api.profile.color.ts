import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { getDb } from 'db/init'

import { getUserFromRequest } from '~/lib/auth.ts'

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserFromRequest(request)
  if (!user) return null
  const formData = await request.formData()
  const color = formData.get('color')
  if (!color) return null
  const db = await getDb()
  const { acknowledged } = await db
    .collection('users')
    .updateOne(
      { email: user.email },
      { $set: { fallbackProfileColor: color } },
    )
  if (!acknowledged) return null
  return redirect(`/profile/${user._id}`)
}
