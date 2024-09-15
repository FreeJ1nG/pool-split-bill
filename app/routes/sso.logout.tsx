import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { destroySession, getSession } from '~/sessions.ts'

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  return redirect('/sso/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  if (request.url.includes('destroySession')) {
    return await action({
      request: new Request(request.url, {
        method: 'POST',
        headers: request.headers,
      }),
      params,
      context,
    })
  }
  else {
    const redirectUrl = encodeURIComponent(
      request.url.split('?')[0] + '?destroySession=true',
    )
    return redirect(`https://sso.ui.ac.id/cas2/logout?url=${redirectUrl}`)
  }
}
