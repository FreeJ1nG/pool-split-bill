import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getDb } from 'db/init'
import { ObjectId } from 'mongodb'

import { billSchema } from '~/schemas/bill.ts'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const billId = params.id
  const db = await getDb()
  const bill = await db
    .collection('bills')
    .findOne({ _id: new ObjectId(billId) })
  return billSchema.safeParse(bill).data
}

export default function BillDetail() {
  const bill = useLoaderData<typeof loader>()

  return <div>{bill.price}</div>
}
