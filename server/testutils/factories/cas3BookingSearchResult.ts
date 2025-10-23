import { Factory } from 'fishery'

import type { Cas3BookingSearchResult } from '@approved-premises/api'
import cas3BookingSearchResultPersonSummaryFactory from './cas3BookingSearchResultPersonSummary'
import cas3BookingSearchResultBookingSummaryFactory from './cas3BookingSearchResultBookingSummary'
import cas3BookingSearchResultPremisesSummaryFactory from './cas3BookingSearchResultPremisesSummary'
import cas3BookingSearchResultBedspaceSummaryFactory from './cas3BookingSearchResultBedspaceSummary'

export default Factory.define<Cas3BookingSearchResult>(() => ({
  person: cas3BookingSearchResultPersonSummaryFactory.build(),
  booking: cas3BookingSearchResultBookingSummaryFactory.build(),
  premises: cas3BookingSearchResultPremisesSummaryFactory.build(),
  bedspace: cas3BookingSearchResultBedspaceSummaryFactory.build(),
}))
