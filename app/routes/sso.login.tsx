import type { LoaderFunctionArgs } from '@remix-run/node'
import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { getDb } from 'db/init'
import { XMLParser } from 'fast-xml-parser'
import type { Document, WithId, WithoutId } from 'mongodb'

import { PROFILE_COLOR_CHOICES } from '~/constants/color.ts'
import { issueJwt } from '~/lib/auth.ts'
import dayjs from '~/lib/dayjs.ts'
import type { User } from '~/schemas/auth.ts'
import { ssoValidateTicketResponseSchema, userSchema } from '~/schemas/auth.ts'
import { commitSession, getSession } from '~/sessions.ts'

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))

  const formData = await request.formData()
  const ticket = formData.get('ticket')
  const service = formData.get('service')

  const resp = await fetch(
    `https://sso.ui.ac.id/cas2/serviceValidate?ticket=${ticket}&service=${service}`,
  )
  if (!resp.ok) return null

  const parser = new XMLParser()
  const data = parser.parse(await resp.text())

  const { success, data: userData } =
    ssoValidateTicketResponseSchema.safeParse(data)
  if (!success) return null

  const userAttributes =
    userData['cas:serviceResponse']['cas:authenticationSuccess']
  const email = userAttributes['cas:user'] + '@ui.ac.id'

  const db = await getDb()
  let user: WithId<Document> | WithoutId<User> | null = await db
    .collection('users')
    .findOne({ email })

  if (user) {
    // User already exists, issue new JWT
    user = userSchema.parse(user)
  }
  else {
    // Create user and issue JWT
    const userToCreate = {
      name: userAttributes['cas:attributes']['cas:nama'],
      org: userAttributes['cas:attributes']['cas:kd_org'],
      npm: userAttributes['cas:attributes']['cas:npm'],
      createdAt: dayjs().unix(),
      fallbackProfileColor:
        PROFILE_COLOR_CHOICES[
          Math.floor(Math.random() * PROFILE_COLOR_CHOICES.length)
        ],
      email,
    } satisfies WithoutId<User>
    const { acknowledged } = await db
      .collection('users')
      .insertOne(userToCreate)
    if (!acknowledged) return null
    user = userToCreate
  }

  session.set('accessToken', await issueJwt(user.email))
  const back = session.get('backUrl')
  session.unset('backUrl')

  return redirect(back ?? '/', {
    headers: {
      'Set-Cookie': await commitSession(session, {
        expires: dayjs().add(30, 'day').toDate(),
      }),
    },
  })
}

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const urlSplit = request.url.split('?')
  if (urlSplit.length === 2) {
    // Means that it contains queryParams
    const service = urlSplit[0]
    const search = urlSplit[1]
    const searchParams = new URLSearchParams(search)

    const ticket = searchParams.get('ticket')
    if (ticket) {
      const formData = new FormData()
      formData.set('ticket', ticket)
      formData.set('service', service)
      return await action({
        request: new Request(request.url, {
          method: 'POST',
          headers: request.headers,
          body: formData,
        }),
        params,
        context,
      })
    }

    return redirect(
      `https://sso.ui.ac.id/cas2/login?service=${encodeURIComponent(service)}`,
    )
  }

  return redirect(
    `https://sso.ui.ac.id/cas2/login?service=${encodeURIComponent(request.url)}`,
  )
}
