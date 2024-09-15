import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToJson<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T,
): z.infer<T> {
  return schema.parse(
    Object.fromEntries(
      Array.from(formData.keys(), key => [key, formData.get(key)]),
    ),
  )
}
