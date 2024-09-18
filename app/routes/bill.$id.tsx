import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, useLoaderData } from '@remix-run/react'
import dayjs from 'dayjs'
import { getDb } from 'db/init'
import { ObjectId } from 'mongodb'
import { useState } from 'react'

import { calculateParticipantsPrice } from '~/lib/price.ts'
import { formatToCurrency, toFixedIfNeeded } from '~/lib/utils.ts'
import { billSchema } from '~/schemas/bill.ts'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const billId = params.id
  const db = await getDb()
  const bill = await db
    .collection('bills')
    .findOne({ _id: new ObjectId(billId) })
  return json(billSchema.safeParse(bill).data)
}

export default function BillDetail() {
  const bill = useLoaderData<typeof loader>()
  const [priceMap] = useState(() => calculateParticipantsPrice(bill))

  return (
    <div className="flex flex-col gap-3">
      <div>
        This bill was created by
        <b>{' ' + bill.owner.name}</b>
      </div>
      <div>{dayjs(bill.startTime).format('dddd, D MMMM YYYY')}</div>
      <div>
        {dayjs(bill.startTime).format('h:mm A') + ' '}
        -
        {' ' + dayjs(bill.endTime).format('h:mm A') + ' '}
        {'(' +
        toFixedIfNeeded((bill.endTime - bill.startTime) / (60 * 60 * 1000)) +
        ' hours)'}
      </div>
      <div className="">
        {bill.participants
          .filter(({ user: { email } }) => email !== bill.owner.email)
          .map(participant => (
            <div key={participant.user._id}>
              {participant.user.name + ' '}
              owes
              {' ' +
              formatToCurrency(priceMap.get(participant.user.email) ?? 0)}
            </div>
          ))}
      </div>
    </div>
  )
}
