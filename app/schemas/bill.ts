import { z } from 'zod'

export const participantSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  email: z.string(),
})

export type Participant = z.infer<typeof participantSchema>

export const billSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  price: z.number(),
  participants: z.array(participantSchema),
})

export type Bill = z.infer<typeof billSchema>

export const getBillSchema = z.array(billSchema)

export type GetBillSchema = z.infer<typeof getBillSchema>
