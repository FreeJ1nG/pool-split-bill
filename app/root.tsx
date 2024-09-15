import './tailwind.css'

import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import dayjs from 'dayjs'
import { getDb } from 'db/init'
import jwt from 'jsonwebtoken'
import { useEffect } from 'react'

import Navbar from '~/components/navbar.tsx'
import {
  sessionJwtTokenSchema,
  type User,
  userSchema,
} from '~/schemas/auth.ts'
import { commitSession, getSession } from '~/sessions.ts'
import { useAuthStore } from '~/store/auth.ts'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let userData: User | undefined

  const session = await getSession(request.headers.get('Cookie'))
  const token = session.get('accessToken')

  if (!token) {
    if (!request.url.includes('/sso/')) {
      session.set('backUrl', request.url)
      return redirect('/sso/login', {
        headers: {
          'Set-Cookie': await commitSession(session, {
            expires: dayjs().add(30, 'day').toDate(),
          }),
        },
      })
    }
    return json({ userData })
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!)

    const jwtToken = sessionJwtTokenSchema.parse(decodedToken)

    const db = await getDb()
    const user = await db.collection('users').findOne({ email: jwtToken.sub })

    userData = userSchema.parse(user)
  }
  catch (e) {
    console.log(e)
  }

  return json({ userData })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore()
  const { userData } = useLoaderData<typeof loader>()

  useEffect(() => {
    setUser(userData)
  }, [userData, setUser])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { userData } = useLoaderData<typeof loader>()

  return (
    <div className="relative h-dvh w-full">
      <Navbar userData={userData} />
      <div className="h-14"></div>
      <div className="px-8 py-6">
        <Outlet />
      </div>
    </div>
  )
}
