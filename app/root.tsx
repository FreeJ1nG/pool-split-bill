import './tailwind.css'

import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
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

import Navbar from '~/components/navbar/index.tsx'
import { AuthStoreProvider } from '~/lib/providers/auth-store.tsx'
import {
  sessionJwtTokenSchema,
  type User,
  userSchema,
} from '~/schemas/auth.ts'
import { commitSession, getSession } from '~/sessions.ts'

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Pool Split Bill',
      content:
        'Split your pool bill fairly here! it\'s as simple as the click of a button',
    },
  ]
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
    rel: 'stylesheet',
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
    console.log('unable to parse user:', e)
  }

  return json({ userData })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { userData } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthStoreProvider userData={userData}>{children}</AuthStoreProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { userData } = useLoaderData<typeof loader>()

  return (
    <div className="relative h-dvh w-full font-poppins">
      <Navbar userData={userData} />
      <div className="h-14"></div>
      <div className="px-8 py-6">
        <Outlet />
      </div>
    </div>
  )
}
