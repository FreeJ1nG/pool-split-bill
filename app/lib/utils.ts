import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToJson<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T,
  extraData?: Partial<z.infer<T>>,
): z.infer<T> {
  const data = {
    ...Object.fromEntries(
      Array.from(formData.keys(), key => [key, formData.get(key)]),
    ),
    ...extraData,
  }
  return schema.parse(data)
}

/**
 * @link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
export function shuffle<T>(arr: T[]) {
  let currentIndex = arr.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    // And swap it with the current element.
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ]
  }
}

export function getAbbreviatedName(name: string) {
  return name
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export function toFixedIfNeeded(num: number, decimalPlaces: number = 3) {
  return parseFloat(num.toFixed(decimalPlaces))
}

export function formatToCurrency(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(num)
}
