import type { Bill } from '~/schemas/bill.ts'

export function calculateParticipantsPrice(bill: Bill): Map<string, number> {
  const billDurationInMinutes = Math.floor(
    (bill.endTime - bill.startTime) / 60000,
  )
  const pricePerMinute = bill.price / billDurationInMinutes

  const priceMap: Map<string, number> = new Map()
  const playingAtMinute: Set<string> = new Set()

  for (
    let minute = Math.floor(bill.startTime / 60000);
    minute < Math.floor(bill.endTime / 60000);
    minute++
  ) {
    for (const participant of bill.participants) {
      const participantStart = Math.floor(participant.startTime / 60)
      const participantEnd = Math.floor(participant.endTime / 60)
      if (participantStart <= minute && minute <= participantEnd) {
        playingAtMinute.add(participant.user.email)
      }
      else {
        playingAtMinute.delete(participant.user.email)
      }
    }
    for (const email of playingAtMinute) {
      priceMap.set(
        email,
        (priceMap.get(email) ?? 0) + pricePerMinute / playingAtMinute.size,
      )
    }
  }

  return priceMap
}
