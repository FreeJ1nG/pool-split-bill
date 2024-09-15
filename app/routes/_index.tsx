import { json, type MetaFunction } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import dayjs from 'dayjs'
import { getDb } from 'db/init'
import { Plus } from 'lucide-react'

import { Button } from '~/components/ui/button.tsx'
import { getBillSchema } from '~/schemas/bill.ts'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pool Payment Tracker' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export const loader = async () => {
  const db = await getDb()
  const sessions = await db.collection('bills').find({}).limit(10).toArray()
  const bills = getBillSchema.parse(sessions)
  return json({ bills })
}

export default function Index() {
  const navigate = useNavigate()
  const { bills } = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col items-center gap-5">
      <Button onClick={() => navigate('/new')} size="sm" className="w-fit">
        <Plus size={20} className="mr-2" />
        Create New
      </Button>
      {bills.map((bill, i) => (
        <button
          key={i}
          className="flex w-full flex-col rounded-xl border border-gray-600 p-4 py-3 text-sm shadow-md"
        >
          <div>{dayjs(bill.startTime).format('dddd, MMMM D, YYYY')}</div>
          <div className="mt-0.5 text-xs">
            {dayjs(bill.startTime).format('h:mm A') + ' '}
            -
            {' ' + dayjs(bill.endTime).format('h:mm A') + ' '}
            (
            {((bill.endTime - bill.startTime) / (60 * 60 * 1000)).toFixed(3)}
            {' '}
            hours)
          </div>
          <div className="mt-1 font-semibold">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(bill.price)}
          </div>
        </button>
      ))}
    </div>
  )
}
