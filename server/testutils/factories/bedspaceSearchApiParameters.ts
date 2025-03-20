import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { Cas3BedspaceSearchParameters } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceData from './referenceData'

export default Factory.define<Cas3BedspaceSearchParameters>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  durationDays: faker.number.int({ min: 1, max: 10 }),
  probationDeliveryUnits: [referenceData.pdu().build().id, referenceData.pdu().build().id],
}))
