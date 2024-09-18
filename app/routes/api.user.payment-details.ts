import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { getDb } from 'db/init'

import { getUserFromRequest } from '~/lib/auth.ts'
import { convertToJson } from '~/lib/utils.ts'
import { paymentDetailSchema } from '~/schemas/auth.ts'

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserFromRequest(request)
  if (!user)
    throw new Error('This api must be called by an authenticated user')

  const db = await getDb()
  const collection = db.collection('users')

  const formData = await request.formData()
  const { acknowledged } = await collection.updateOne(
    { email: user.email },
    {
      $addToSet: {
        paymentDetail: convertToJson(formData, paymentDetailSchema),
      },
    },
  )
  if (!acknowledged) throw new Error('Unable to update user data')
  return redirect(`/profile/${user._id}`)
}
