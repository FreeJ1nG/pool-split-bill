import { json, type MetaFunction } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import dayjs from 'dayjs'
import { getDb } from 'db/init'
import { Plus } from 'lucide-react'

import { Avatar, AvatarFallback } from '~/components/ui/avatar.tsx'
import { Button } from '~/components/ui/button.tsx'
import {
  cn,
  formatToCurrency,
  getAbbreviatedName,
  toFixedIfNeeded,
} from '~/lib/utils.ts'
import type { Bill } from '~/schemas/bill.ts'
import { getBillsSchema } from '~/schemas/bill.ts'

export const meta: MetaFunction = () => {
  return [{ title: 'Pool Payment Tracker' }]
}

export const loader = async () => {
  const db = await getDb()
  const billsCollection = await db
    .collection('bills')
    .find({})
    .limit(10)
    .toArray()
  const { success, data: bills } = getBillsSchema.safeParse(billsCollection)
  if (!success)
    return json({
      bills: [] as Bill[],
      error: 'Unable to parse bills, something is wrong',
    })
  return json({ bills, error: null })
}

export default function Index() {
  const navigate = useNavigate()
  const { bills, error } = useLoaderData<typeof loader>()

  console.log(' >> bills:', bills)

  return (
    <div className="flex flex-col items-center gap-5">
      <Button onClick={() => navigate('/new')} size="sm" className="w-fit">
        <Plus size={20} className="mr-2" />
        Create New
      </Button>
      {error && <div className="text-sm font-medium text-red-600">{error}</div>}
      {bills.map(bill => (
        <button
          onClick={() => navigate(`/bill/${bill._id}`)}
          key={bill._id}
          className="flex w-full flex-col rounded-xl border border-gray-600 p-4 py-3 text-sm shadow-md"
        >
          <div>{dayjs(bill.startTime).format('dddd, MMMM D, YYYY')}</div>
          <div className="mt-0.5 text-xs">
            {dayjs(bill.startTime).format('h:mm A') + ' '}
            -
            {' ' + dayjs(bill.endTime).format('h:mm A') + ' '}
            {'(' +
            toFixedIfNeeded(
              (bill.endTime - bill.startTime) / (60 * 60 * 1000),
            ) +
            ' hours)'}
          </div>
          <div className="relative mt-2 flex h-8">
            <Avatar className="absolute left-0 z-[100] h-8 w-8 border-[3px] border-purple-600">
              <AvatarFallback
                className="text-xs"
                style={{ backgroundColor: bill.owner.fallbackProfileColor }}
              >
                {getAbbreviatedName(bill.owner.name)}
              </AvatarFallback>
            </Avatar>
            {bill.participants
              .filter(p => p.user.email !== bill.owner.email)
              .slice(0, 2)
              .map((participant, i) => (
                <Avatar
                  key={participant.user.email}
                  className={cn('absolute h-8 w-8 border-2 border-white', {
                    'left-6 z-[90]': i === 0,
                    'left-12 z-[80]': i === 1,
                  })}
                >
                  <AvatarFallback
                    className="text-xs"
                    style={{
                      backgroundColor: participant.user.fallbackProfileColor,
                    }}
                  >
                    {getAbbreviatedName(participant.user.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            {bill.participants.length > 3 && (
              <Avatar className="absolute left-[72px] h-8 w-8 border-2 border-white">
                <AvatarFallback className="bg-gray-300 text-sm">
                  {`+${bill.participants.length - 3}`}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="mt-1 font-semibold">
            {formatToCurrency(bill.price)}
          </div>
        </button>
      ))}
    </div>
  )
}
