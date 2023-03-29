import type { BedSearchResult } from '@approved-premises/api'
import type { SummaryList } from '@approved-premises/ui'

export default (bedSearchResult: BedSearchResult): SummaryList['rows'] => {
  const rows = [
    {
      key: textValue('Address'),
      value: textValue(`${bedSearchResult.premises.addressLine1}, ${bedSearchResult.premises.postcode}`),
    },
    {
      key: textValue('Bedspaces in property'),
      value: textValue(`${bedSearchResult.premises.bedCount}`),
    },
  ] as SummaryList['rows']

  return rows
}

const textValue = (value: string) => {
  return { text: value }
}
