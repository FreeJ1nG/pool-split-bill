import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

const dayjsExt = dayjs

dayjs.extend(utc)
dayjs.extend(timezone)
dayjsExt.tz.setDefault('Asia/Jakarta')

export default dayjsExt
