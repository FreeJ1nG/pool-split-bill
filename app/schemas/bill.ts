import dayjs from 'dayjs'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

import { userBuilderSchema, userSchema } from './auth.ts'

export const participantSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  user: userSchema,
})

export type Participant = z.infer<typeof participantSchema>

export const billSchema = z.object({
  _id: z.instanceof(ObjectId).transform(id => id.toHexString()),
  startTime: z.number(),
  endTime: z.number(),
  price: z.number(),
  participants: z.array(participantSchema),
  owner: userSchema,
})

export type Bill = z.infer<typeof billSchema>

export const getBillsSchema = z.array(billSchema)

export type GetBillsSchema = z.infer<typeof getBillsSchema>

export const createBillSchema = billSchema.omit({ _id: true }).extend({
  startTime: z.preprocess(
    arg => (typeof arg === 'string' ? dayjs(arg).unix() * 1000 : arg),
    z.number(),
  ),
  endTime: z.preprocess(
    arg => (typeof arg === 'string' ? dayjs(arg).unix() * 1000 : arg),
    z.number(),
  ),
  price: z.preprocess(
    arg => (typeof arg === 'string' ? parseInt(arg) : arg),
    z.number(),
  ),
  participants: z.preprocess(
    arg => (typeof arg === 'string' ? JSON.parse(arg) : arg),
    z.array(
      participantSchema.extend({
        user: userBuilderSchema,
      }),
    ),
  ),
  owner: userBuilderSchema,
})

export type CreateBillSchema = z.infer<typeof createBillSchema>
