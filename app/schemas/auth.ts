import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const userSchema = z.object({
  _id: z.instanceof(ObjectId).transform(id => id.toString('base64')),
  name: z.string(),
  org: z.string(),
  npm: z.number(),
  email: z.string(),
  createdAt: z.number(),
  profileSrc: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

export const ssoValidateTicketResponseSchema = z.object({
  'cas:serviceResponse': z.object({
    'cas:authenticationSuccess': z.object({
      'cas:user': z.string(),
      'cas:attributes': z.object({
        'cas:ldap_cn': z.string(),
        'cas:kd_org': z.string(),
        'cas:peran_user': z.string(),
        'cas:nama': z.string(),
        'cas:npm': z.number(),
      }),
    }),
  }),
})

export type SsoValidateTicketResponse = z.infer<
  typeof ssoValidateTicketResponseSchema
>

export const sessionJwtTokenSchema = z.object({
  sub: z.string(),
  iat: z.number(),
  exp: z.number(),
})
