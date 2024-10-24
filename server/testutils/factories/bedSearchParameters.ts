import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import {
  TemporaryAccommodationBedSearchParameters as BedSearchAPIParameters,
  BedSearchAttributes,
} from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceData from './referenceData'

const bedSearchAttributes: Array<BedSearchAttributes> = ['singleOccupancy', 'sharedProperty']

export default Factory.define<BedSearchAPIParameters>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  durationDays: faker.number.int({ min: 1, max: 10 }),
  probationDeliveryUnits: [referenceData.pdu().build().id, referenceData.pdu().build().id],
  serviceName: 'temporary-accommodation',
  attributes: faker.helpers.arrayElements(bedSearchAttributes),
}))
