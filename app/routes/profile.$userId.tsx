import { PopoverClose } from '@radix-ui/react-popover'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import dayjs from 'dayjs'
import { getDb } from 'db/init'
import { ObjectId } from 'mongodb'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/components/ui/avatar.tsx'
import { Button } from '~/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card.tsx'
import { Input } from '~/components/ui/input.tsx'
import { Label } from '~/components/ui/label.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover.tsx'
import { getAbbreviatedName } from '~/lib/utils.ts'
import { userSchema } from '~/schemas/auth.ts'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const userId = params.userId
  const db = await getDb()
  const user = await db
    .collection('users')
    .findOne({ _id: new ObjectId(userId) })
  if (!user)
    return json({
      error: 'Unable to find user profile, maybe the user doesn\'t exist?',
      user: null,
    })

  const { success, data: userData } = userSchema.safeParse(user)
  if (!success)
    return json({
      error:
        'Unable to parse user fetched from DB, something seems to be off with the user interface',
      user: null,
    })

  return json({
    error: null,
    user: userData,
  })
}

export default function UserProfile() {
  const { user, error } = useLoaderData<typeof loader>()

  console.log(' >> user:', user)

  return (
    <div className="flex flex-col items-center">
      {error && <div className="text-sm font-medium text-red-600">{error}</div>}
      {user && (
        <>
          <div className="mb-1 font-semibold">{user.name}</div>
          <Avatar className="h-14 w-14 text-2xl">
            <AvatarImage src={user.profileSrc} />
            <AvatarFallback
              style={{ backgroundColor: user.fallbackProfileColor }}
            >
              {getAbbreviatedName(user.name)}
            </AvatarFallback>
          </Avatar>
          <Input value={user.email} className="mt-3" disabled />
          <Input value={user.npm} className="mt-2" disabled />
          <Card className="mt-3 w-full">
            <CardHeader className="px-4 pb-2 pt-4 text-base">
              <CardTitle>Payment Detail</CardTitle>
            </CardHeader>
            {user.paymentDetail && (
              <CardContent className="px-4 pb-2 pt-2">
                <div className="flex flex-col gap-2">
                  {user.paymentDetail?.map(({ provider, account }) => (
                    <Input value={provider + ' - ' + account} disabled />
                  ))}
                </div>
              </CardContent>
            )}
            <CardFooter className="px-4 pb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" className="mt-3 w-full">
                    Add payment details
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Form method="POST" action="/api/user/payment-details">
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      name="provider"
                      className="mt-1 h-8"
                      placeholder="Gopay, BCA, BNI"
                    />

                    <div className="mt-2" />

                    <Label htmlFor="account">Account Number</Label>
                    <Input
                      id="account"
                      name="account"
                      className="mt-1 h-8"
                      placeholder="082214093455"
                    />

                    <PopoverClose>
                      <div className="flex justify-end">
                        <Button type="submit" className="sm mt-3 h-8 text-xs">
                          Save
                        </Button>
                      </div>
                    </PopoverClose>
                  </Form>
                </PopoverContent>
              </Popover>
            </CardFooter>
          </Card>
          <div className="mt-3 text-sm">
            Joined since
            {' '}
            {dayjs(user.createdAt).format('dddd, D MMMM YYYY')}
          </div>
        </>
      )}
    </div>
  )
}
