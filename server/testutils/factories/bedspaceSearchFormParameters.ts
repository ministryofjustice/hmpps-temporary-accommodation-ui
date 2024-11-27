import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { BedspaceSearchFormParameters, OccupancyAttribute } from '../../@types/ui'
import { DateFormats } from '../../utils/dateUtils'
import referenceData from './referenceData'

const occupancyAttributes: Array<OccupancyAttribute> = ['all', 'singleOccupancy', 'sharedProperty']

export default Factory.define<BedspaceSearchFormParameters>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  durationDays: faker.number.int({ min: 1, max: 10 }),
  probationDeliveryUnits: [referenceData.pdu().build().id, referenceData.pdu().build().id],
  occupancyAttribute: faker.helpers.arrayElement(occupancyAttributes),
}))
