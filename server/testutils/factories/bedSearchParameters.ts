import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import { TemporaryAccommodationBedSearchParameters as BedSearchAPIParameters } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceData from './referenceData'

// NOTE: this fixes mismatched GET/POST types for bedspace searches.
type BedSearchUIParameters = BedSearchAPIParameters & {
  sharedProperty?: string
  singleOccupancy?: string
}

export default Factory.define<BedSearchUIParameters>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  durationDays: faker.number.int({ min: 1, max: 10 }),
  probationDeliveryUnit: referenceData.pdu().build().name,
  serviceName: 'temporary-accommodation',
}))
