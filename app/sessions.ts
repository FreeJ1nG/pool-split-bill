import { createCookieSessionStorage } from '@remix-run/node'

export type SessionData = {
  accessToken: string
  backUrl: string
}

export type SessionFlashData = {
  error: string
}

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: 'pool-tracker__auth',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 1 month
      path: '/',
      sameSite: 'lax',
      secrets: [process.env.JWT_SECRET!],
    },
  })
