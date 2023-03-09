import type { TemporaryAccommodationLostBed as LostBed } from '@approved-premises/api'
import type { SummaryList } from '@approved-premises/ui'
import { DateFormats } from '../utils/dateUtils'
import { formatLines } from '../utils/viewUtils'
import { statusTag } from '../utils/lostBedUtils'

export default (lostBed: LostBed): SummaryList['rows'] => {
  const { status, startDate, endDate } = lostBed

  const rows: SummaryList['rows'] = []

  rows.push({
    key: textValue('Status'),
    value: htmlValue(statusTag(status, 'voidsOnly')),
  })

  rows.push({
    key: textValue('Start date'),
    value: textValue(DateFormats.isoDateToUIDate(startDate)),
  })

  rows.push({
    key: textValue('End date'),
    value: textValue(DateFormats.isoDateToUIDate(endDate)),
  })

  rows.push({
    key: textValue('Notes'),
    value: htmlValue(formatLines(lostBed.notes)),
  })

  return rows
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}
