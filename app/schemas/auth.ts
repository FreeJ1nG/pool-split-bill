import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const paymentDetailSchema = z.object({
  provider: z.string(),
  account: z.string(),
})

export const userSchema = z.object({
  _id: z.instanceof(ObjectId).transform(id => id.toHexString()),
  name: z.string(),
  org: z.string(),
  npm: z.number(),
  email: z.string(),
  createdAt: z.number(),
  fallbackProfileColor: z.string().optional(),
  profileSrc: z.string().optional(),
  paymentDetail: z.array(paymentDetailSchema).optional(),
})

export type User = z.infer<typeof userSchema>

export const userBuilderSchema = userSchema.extend({
  _id: z.preprocess(
    arg => (typeof arg === 'string' ? new ObjectId(arg) : arg),
    z.instanceof(ObjectId),
  ),
})

export type UserBuilder = z.infer<typeof userBuilderSchema>

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
