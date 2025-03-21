import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { BedspaceSearchFormParameters } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import referenceData from './referenceData'

export default Factory.define<BedspaceSearchFormParameters>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  durationDays: faker.number.int({ min: 1, max: 10 }),
  probationDeliveryUnits: [referenceData.pdu().build().id, referenceData.pdu().build().id],
  occupancyAttribute: 'all',
  accessibilityAttributes: [],
}))
