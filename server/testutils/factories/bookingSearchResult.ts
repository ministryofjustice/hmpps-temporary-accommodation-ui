import { Factory } from 'fishery'

import type { BookingSearchResult } from '@approved-premises/api'
import bookingSearchResultPersonSummaryFactory from './bookingSearchResultPersonSummary'
import bookingSearchResultBookingSummaryFactory from './bookingSearchResultBookingSummary'
import bookingSearchResultPremisesSummaryFactory from './bookingSearchResultPremisesSummary'
import bookingSearchResultRoomSummaryFactory from './bookingSearchResultRoomSummary'
import bookingSearchResultBedSummaryFactory from './bookingSearchResultBedSummary'

export default Factory.define<BookingSearchResult>(() => ({
  person: bookingSearchResultPersonSummaryFactory.build(),
  booking: bookingSearchResultBookingSummaryFactory.build(),
  premises: bookingSearchResultPremisesSummaryFactory.build(),
  room: bookingSearchResultRoomSummaryFactory.build(),
  bed: bookingSearchResultBedSummaryFactory.build(),
}))
