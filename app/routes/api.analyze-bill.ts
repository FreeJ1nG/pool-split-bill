import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import OpenAI from 'openai'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const imageUrl = formData.get('url')
  if (!imageUrl || typeof imageUrl !== 'string')
    throw new Error('Invalid request, must contain string url in formData')

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please describe the start time, end time, duration, and the total bill
            from the following image, describe them in JSON, just like this
            {
              startTime: <Unix of start time>,
              endTime: <Unix of end time>,
              duration: <Duration in minutes>,
              totalBill: <An integer describing the amount of money the total bill is>
            }
            Note that all time is written in UTC+7
            Output everything in plain string format, without any other text
            `,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
  })

  const bill = response.choices[0].message.content
  const searchParams = new URLSearchParams(
    bill ? { bill: encodeURIComponent(bill) } : {},
  ).toString()

  if (bill) {
    return redirect(`/new?${searchParams}`)
  }
}
