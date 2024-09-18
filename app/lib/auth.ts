import { getDb } from 'db/init'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

import { sessionJwtTokenSchema, userSchema } from '~/schemas/auth.ts'
import { getSession } from '~/sessions.ts'

export async function issueJwt(email: string): Promise<string> {
  return jwt.sign({ sub: email }, process.env.JWT_SECRET!, {
    expiresIn: '30 days',
  })
}

export async function getUserFromRequest(request: Request) {
  const session = await getSession(request.headers.get('Cookie'))
  const token = session.get('accessToken')

  if (!token) return undefined

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!)

    const jwtToken = sessionJwtTokenSchema.parse(decodedToken)

    const db = await getDb()
    const user = await db.collection('users').findOne({ email: jwtToken.sub })

    return userSchema.extend({ _id: z.instanceof(ObjectId) }).parse(user)
  }
  catch (e) {
    console.log(e)
  }

  return undefined
}
