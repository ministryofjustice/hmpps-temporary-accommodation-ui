import type { Cas3VoidBedspace } from '@approved-premises/api'
import type { SummaryList } from '@approved-premises/ui'
import { DateFormats } from '../utils/dateUtils'

export const summaryListRows = (lostBed: Cas3VoidBedspace): SummaryList['rows'] => {
  const rows = [
    {
      key: textValue('Start date'),
      value: textValue(DateFormats.isoDateToUIDate(lostBed.startDate)),
    },
    {
      key: textValue('End date'),
      value: textValue(DateFormats.isoDateToUIDate(lostBed.endDate)),
    },
  ] as SummaryList['rows']

  return rows
}

const textValue = (value: string) => {
  return { text: value }
}
