import { type ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { Form, useLoaderData, useLocation, useSubmit } from '@remix-run/react'
import dayjs, { type Dayjs } from 'dayjs'
import { getDb } from 'db/init.ts'
import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import { z } from 'zod'

import CreateBillParticipantsCommand from '~/components/create-bill/command.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Input } from '~/components/ui/input.tsx'
import { Label } from '~/components/ui/label.tsx'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs.tsx'
import { UploadDropzone } from '~/components/ut/upload-dropzone.tsx'
import { getUserFromRequest } from '~/lib/auth.ts'
import { useAuthStore } from '~/lib/providers/auth-store.tsx'
import { convertToJson } from '~/lib/utils.ts'
import { userSchema } from '~/schemas/auth.ts'
import { createBillSchema, type Participant } from '~/schemas/bill.ts'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const db = await getDb()
  const collection = db.collection('bills')
  const owner = await getUserFromRequest(request)
  const data = convertToJson(formData, createBillSchema, { owner })
  if (!owner) return redirect('/new')
  const result = await collection.insertOne(data)
  if (result.acknowledged) return redirect('/')
  return redirect('/new')
}

export const loader = async () => {
  const db = await getDb()
  const collection = db.collection('users')
  const userArray = await collection.find({}).toArray()
  const users = z.array(userSchema).parse(userArray)
  return json({ users })
}

export default function CreateForm() {
  const user = useAuthStore(state => state.user)
  const submit = useSubmit()
  const { search } = useLocation()
  const { users } = useLoaderData<typeof loader>()
  const [file, setFile] = useState<File | undefined>(undefined)
  const [startTime, setStartTime] = useState<Dayjs>(dayjs())
  const [endTime, setEndTime] = useState<Dayjs>(dayjs())
  const [participants, setParticipants] = useState<Participant[]>(
    user
      ? [
          {
            startTime: startTime.unix(),
            endTime: endTime.unix(),
            user,
          },
        ]
      : [],
  )

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget as HTMLFormElement)
      formData.append('participants', JSON.stringify(participants))
      submit(formData, { method: 'POST' })
    },
    [participants, submit],
  )

  return (
    <div className="flex flex-col items-center">
      <Tabs defaultValue="form" className="flex w-full flex-col items-center">
        <TabsList>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="experimental">Experimental</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="w-full">
          <Form onSubmit={handleSubmit}>
            <Label htmlFor="startTime">Start time</Label>
            <Input
              value={startTime.format('YYYY-MM-DDTHH:mm')}
              onChange={e => setStartTime(dayjs(e.target.value))}
              id="startTime"
              name="startTime"
              type="datetime-local"
              className="mb-3 w-fit"
            />

            <Label htmlFor="endTime">End time</Label>
            <Input
              value={endTime.format('YYYY-MM-DDTHH:mm')}
              onChange={e => setEndTime(dayjs(e.target.value))}
              id="endTime"
              name="endTime"
              type="datetime-local"
              className="mb-3 w-fit"
            />

            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="Insert the total price"
            />

            <CreateBillParticipantsCommand
              users={users}
              participants={participants}
              setParticipants={setParticipants}
              startTime={startTime}
              endTime={endTime}
            />

            <Button type="submit" className="mt-7 w-full">
              Submit
            </Button>
          </Form>
        </TabsContent>
        <TabsContent value="experimental">
          <Form>
            <div className="my-3 font-bold">
              Upload a picture of your bill here
            </div>
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (Array.isArray(res) && res.length > 0) {
                  const formData = new FormData()
                  formData.append('url', res[0].url)
                  submit(formData, {
                    method: 'POST',
                    action: '/api/analyze-bill',
                  })
                }
              }}
              onChange={newFiles =>
                setFile(newFiles.length > 0 ? newFiles[0] : undefined)}
              className="mb-6"
            />
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-80"
              />
            )}
            {decodeURIComponent(new URLSearchParams(search).get('bill') ?? '')}
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
