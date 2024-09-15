import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { Form, useLocation, useSubmit } from '@remix-run/react'
import { getDb } from 'db/init.ts'
import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'

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
import { convertToJson } from '~/lib/utils.ts'
import { billSchema, type Participant } from '~/schemas/bill.ts'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const db = await getDb()
  const collection = db.collection('session')
  const result = await collection.insertOne(
    convertToJson(formData, billSchema),
  )
  if (result.acknowledged) return redirect('/')
  return redirect('/new')
}

export default function CreateForm() {
  const submit = useSubmit()
  const { search } = useLocation()
  const [file, setFile] = useState<File | undefined>(undefined)
  const [participants, setParticipants] = useState<Participant[]>([])

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget as HTMLFormElement)
      formData.append('participants[]', JSON.stringify(participants))
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
              name="startTime"
              type="datetime-local"
              className="mb-3 w-fit"
            />

            <Label htmlFor="endTime">End time</Label>
            <Input
              name="endTime"
              type="datetime-local"
              className="mb-3 w-fit"
            />

            <Label htmlFor="price">Price</Label>
            <Input name="price" type="number" />

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
