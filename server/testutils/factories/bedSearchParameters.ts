import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import { TemporaryAccommodationBedSearchParameters as BedSearchParameters } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceData from './referenceData'

export default Factory.define<BedSearchParameters>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  durationDays: faker.number.int({ min: 1, max: 10 }),
  probationDeliveryUnit: referenceData.pdu().build().id,
}))
